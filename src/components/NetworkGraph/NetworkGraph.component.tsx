'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import ForceGraph2D from 'react-force-graph-2d';
import type { ForceGraphMethods } from 'react-force-graph-2d';
import clsx from 'clsx';
import _ from 'lodash';

import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { TablePagination } from '@/components/Pagination';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { isString, equalsIgnoreCase, find } from '@/lib/string';
import { isNumber, toNumber } from '@/lib/number';

import { networkGraphStyles as styles } from './NetworkGraph.styles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NetworkDataItem {
  id?: string;
  sourceChain: string;
  destinationChain: string;
  num_txs: number;
  volume?: number;
  [key: string]: unknown;
}

interface NetworkGraphProps {
  data: NetworkDataItem[] | null;
  hideTable?: boolean;
  setChainFocus?: (chainId: string | null) => void;
}

interface GraphNode {
  id: string;
  image: string;
  label: string;
  color: string;
  num_txs: number;
  tier?: number;
  x?: number;
  y?: number;
  __animatedPos?: { x: number; y: number }[];
}

interface GraphEdge {
  data: NetworkDataItem;
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  color: string;
  __comet?: { __progress: number };
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

type ImagesMap = Record<string, HTMLImageElement>;

// ---------------------------------------------------------------------------
// Image preloading
// ---------------------------------------------------------------------------

const preloadImagePromise = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = img.onabort = () => reject();
    img.src = src;
    img.crossOrigin = 'anonymous';
  });

const getImageAsync = async (url: string): Promise<HTMLImageElement | undefined> => {
  try {
    return await preloadImagePromise(url);
  } catch (error) {
    return;
  }
};

const useImagePreloader = (images: string[]): ImagesMap => {
  const [imagesMap, setImagesMap] = useState<ImagesMap>({});

  useEffect(() => {
    const preloadImages = async () => {
      images.forEach(async url => {
        if (imagesMap[url]) return;

        const image = await getImageAsync(url);

        if (image) {
          setImagesMap(d => ({ ...d, [url]: image }));
        }
      });
    };

    if (images) {
      preloadImages();
    }
  }, [images, imagesMap]);

  return imagesMap;
};

// ---------------------------------------------------------------------------
// Canvas drawing helpers
// ---------------------------------------------------------------------------

const drawNode = (
  node: GraphNode,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  isSelected: boolean,
  image?: HTMLImageElement,
) => {
  let { x, y } = node;
  if (x === undefined || y === undefined) return;

  const radius =
    (TIERS.length + 1 + Math.pow(2, TIERS.length + 1 - (node.tier || 1))) / 2;
  const fillStyleOpecity = isSelected ? '1a' : '0d';

  if (node.color && isSelected) {
    ctx.strokeStyle = node.color;
    ctx.fillStyle = `${node.color}${fillStyleOpecity}`;
    ctx.beginPath();
    ctx.lineWidth = 4 / globalScale;

    const animatedPos = node.__animatedPos;

    if (animatedPos && animatedPos.length > 0) {
      const coord = animatedPos.splice(0, 1);

      node.__animatedPos = animatedPos;
      node.x = x = coord[0].x;
      node.y = y = coord[0].y;
    }

    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 16 * globalScale;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  if (image) {
    const logoRadius = radius - 0.5;
    ctx.drawImage(
      image,
      x - logoRadius,
      y - logoRadius,
      logoRadius * 2,
      logoRadius * 2
    );
  }
};

const drawTitle = (
  node: GraphNode,
  ctx: CanvasRenderingContext2D,
  isSelected: boolean,
  theme: string | undefined,
) => {
  const fontSize = 2;

  const { x, y } = node;
  if (x === undefined || y === undefined) return;

  const radius =
    (TIERS.length +
      1 +
      Math.pow(2, TIERS.length + 1 - (node.tier || 1)) +
      fontSize) /
    2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${isSelected ? '700' : '600'} ${fontSize}px Inter, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif`;
  ctx.fillStyle =
    theme === 'dark'
      ? isSelected
        ? '#f4f4f5'
        : '#d4d4d8'
      : isSelected
        ? '#18181b'
        : '#3f3f46';
  ctx.fillText(node.label, x, y + radius);
};

const drawNodeCanvasObject = (
  node: GraphNode,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  selectedNode: GraphNode | null,
  links: GraphEdge[] | undefined,
  images: ImagesMap,
  theme: string | undefined,
) => {
  if (!node || node.x === undefined || node.y === undefined) return;

  const isSelected = node.id === selectedNode?.id;

  drawNode(node, ctx, globalScale, isSelected, images?.[node.image]);
  drawTitle(node, ctx, isSelected, theme);
};

const useNodeCanvasObject = (
  selectedNode: GraphNode | null,
  links: GraphEdge[] | undefined,
  images: ImagesMap,
  theme: string | undefined,
) =>
  useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) =>
      drawNodeCanvasObject(
        node,
        ctx,
        globalScale,
        selectedNode,
        links,
        images,
        theme
      ),
    [selectedNode, links, images, theme]
  );

const COMET_SPEED = 0.0033;
const COMET_LENGTH = 3;

const drawLine = (
  link: GraphEdge,
  ctx: CanvasRenderingContext2D,
  scale: number,
  isSelected: boolean,
  theme: string | undefined,
) => {
  if (isString(link.source) || isString(link.target)) return;

  if (
    link.source.x != null &&
    link.source.y != null &&
    link.target.x != null &&
    link.target.y != null
  ) {
    ctx.lineWidth = 0.5 / scale;
    ctx.strokeStyle =
      theme === 'dark'
        ? isSelected
          ? '#e4e4e7'
          : '#27272a'
        : isSelected
          ? '#52525b'
          : '#e4e4e7';

    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
  }
};

const calculateAndDrawComet = (
  ctx: CanvasRenderingContext2D,
  targetX: number,
  sourceX: number,
  targetY: number,
  sourceY: number,
  commetProgress: number,
  color: string | undefined,
  theme: string | undefined,
) => {
  const diffX = targetX - sourceX;
  const diffY = targetY - sourceY;
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);

  const endProgress = commetProgress - COMET_LENGTH / distance;
  const cometEndProgress = endProgress > 0 ? endProgress : 0;
  const cometStartX = sourceX + diffX * commetProgress || 0;
  const cometStartY = sourceY + diffY * commetProgress || 0;
  const cometEndX = sourceX + diffX * cometEndProgress || 0;
  const cometEndY = sourceY + diffY * cometEndProgress || 0;

  const gradient = ctx.createLinearGradient(
    cometStartX,
    cometStartY,
    cometEndX,
    cometEndY
  );

  gradient.addColorStop(
    0,
    `${color || (theme === 'dark' ? '#f4f4f5' : '#18181b')}ff`
  );
  gradient.addColorStop(
    1,
    `${color || (theme === 'dark' ? '#f4f4f5' : '#18181b')}00`
  );

  ctx.strokeStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(cometStartX, cometStartY);
  ctx.lineTo(cometEndX, cometEndY);
  ctx.stroke();
};

const drawCommet = (link: GraphEdge, ctx: CanvasRenderingContext2D, theme: string | undefined) => {
  if (isString(link.source) || isString(link.target)) return;

  const { x: sourceX, y: sourceY } = link.source;
  const { x: targetX, y: targetY } = link.target;

  if (
    sourceX === undefined ||
    sourceY === undefined ||
    targetX === undefined ||
    targetY === undefined
  )
    return;

  const comet = link.__comet || { __progress: 0 };
  comet.__progress += COMET_SPEED;

  if (comet.__progress >= 1) {
    link.__comet = undefined;
    return;
  }

  calculateAndDrawComet(
    ctx,
    targetX,
    sourceX,
    targetY,
    sourceY,
    comet.__progress,
    link.color,
    theme
  );

  link.__comet = comet;
};

const drawLinkCanvasObject = (
  link: GraphEdge,
  ctx: CanvasRenderingContext2D,
  scale: number,
  selectedNode: GraphNode | null,
  theme: string | undefined,
) => {
  if (!link) return;

  drawLine(
    link,
    ctx,
    scale,
    [
      typeof link.source === 'string' ? link.source : link.source?.id,
      typeof link.target === 'string' ? link.target : link.target?.id,
    ].includes(selectedNode?.id ?? ''),
    theme
  );
  drawCommet(link, ctx, theme);
};

const useLinkCanvasObject = (selectedNode: GraphNode | null, theme: string | undefined) =>
  useCallback(
    (value: GraphEdge, ctx: CanvasRenderingContext2D, globalScale: number) =>
      drawLinkCanvasObject(value, ctx, globalScale, selectedNode, theme),
    [selectedNode, theme]
  );

// ---------------------------------------------------------------------------
// Statistical helpers
// ---------------------------------------------------------------------------

interface TierConfig {
  id: number;
  n_sd: number | null;
}

const TIERS: TierConfig[] = [
  { id: 1, n_sd: 0.25 },
  { id: 2, n_sd: -0.25 },
  { id: 3, n_sd: null },
];

const MEAN = (data: GraphNode[], field: string = 'num_txs'): number =>
  _.mean(toArray(data).map(d => toNumber(d[field as keyof GraphNode])));

const SD = (data: GraphNode[], field: string = 'num_txs'): number => {
  const items = toArray(data) as GraphNode[];

  if (items.length === 0) {
    return 0;
  }

  return Math.sqrt(
    _.sum(items.map(d => Math.pow(toNumber(d[field as keyof GraphNode]) - MEAN(items, field), 2))) /
      items.length
  );
};

const THRESHOLD = (data: GraphNode[], n_sd: number | null, field: string = 'num_txs'): number =>
  !isNumber(n_sd) ? 0 : MEAN(data, field) + (n_sd as number) * SD(data, field);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const sizePerPage = 10;

export function NetworkGraph({ data, hideTable = false, setChainFocus }: NetworkGraphProps) {
  const graphRef = useRef<ForceGraphMethods>(undefined);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [page, setPage] = useState<number | undefined>(1);
  const { resolvedTheme } = useTheme();
  const chains = useChains();

  useEffect(() => {
    const fg = graphRef.current;

    fg?.d3Force('link', null);
    fg?.d3Force('charge')?.strength(0);
    fg?.d3Force('center')?.strength(0);
  }, []);

  useEffect(() => {
    if (data && chains) {
      const AXELAR = 'axelarnet';

      const _data: NetworkDataItem[] = _.orderBy(
        Object.entries(
          _.groupBy(
            data.flatMap((d) => {
              if (find(AXELAR, [d.sourceChain, d.destinationChain])) {
                return d;
              }

              return [
                [d.sourceChain, AXELAR],
                [AXELAR, d.destinationChain],
              ].map((ids, i) => ({
                ...d,
                id: ids.join('_'),
                [i === 0 ? 'destinationChain' : 'sourceChain']: AXELAR,
              }));
            }),
            'id'
          )
        ).map(([k, v]) => ({
          id: k,
          ...v[0],
          num_txs: _.sumBy(v, 'num_txs'),
          volume: _.sumBy(v, 'volume'),
        })),
        ['num_txs'],
        ['desc']
      );

      // add no traffic pairs
      chains
        .filter((d) => (!d.maintainer_id || !d.no_inflation) && d.id !== AXELAR)
        .forEach((d) => {
          [
            [d.id, AXELAR],
            [AXELAR, d.id],
          ]
            .map(ids => ids.join('_'))
            .forEach((id, i) => {
              if (_data.findIndex((d) => equalsIgnoreCase(d.id, id)) < 0) {
                _data.push({
                  id,
                  sourceChain: i === 0 ? d.id : AXELAR,
                  destinationChain: i === 0 ? AXELAR : d.id,
                  num_txs: 0,
                });
              }
            });
        });

      // create nodes & edges
      let nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];

      _data.forEach((d) => {
        ['source', 'destination'].forEach(s => {
          const id = d[`${s}Chain`] as string;

          if (id && nodes.findIndex(n => equalsIgnoreCase(n.id, id)) < 0) {
            const { name, image, color } = { ...getChainData(id, chains) };

            if (name) {
              nodes.push({
                id,
                image: image ?? '',
                label: name,
                color: color ?? '',
                num_txs: _.sumBy(
                  _data.filter((d) =>
                    find(id, [d.sourceChain, d.destinationChain])
                  ),
                  'num_txs'
                ),
              });
            }
          }
        });

        if (
          ['source', 'destination'].findIndex(
            s =>
              nodes.findIndex(n => equalsIgnoreCase(n.id, d[`${s}Chain`] as string)) < 0
          ) < 0
        ) {
          const { color } = { ...getChainData(d.sourceChain, chains) };

          edges.push({
            data: d,
            id: d.id ?? '',
            source: d.sourceChain,
            target: d.destinationChain,
            color: color ?? '',
          });
        }
      });

      const tiers = TIERS.map(d => ({
        ...d,
        threshold: THRESHOLD(
          nodes.filter(d => d.id !== AXELAR),
          d.n_sd
        ),
      }));

      nodes = _.orderBy(
        nodes.map(d => ({
          ...d,
          tier:
            d.id === AXELAR ? 0 : tiers.find(t => t.threshold <= d.num_txs)?.id,
        })),
        ['num_txs'],
        ['desc']
      );

      setGraphData({ nodes, edges });
    }
  }, [data, setGraphData, resolvedTheme, chains]);

  useEffect(() => {
    if (!page) {
      setPage(1);
    }
  }, [page, setPage]);

  const { nodes, edges } = { ...graphData };

  const imagesUrl = useMemo(() => (toArray(nodes) as GraphNode[]).map((d: GraphNode) => d.image), [nodes]);
  const images = useImagePreloader(toArray(imagesUrl) as string[]);
  const imagesLoaded =
    chains && Object.keys({ ...images }).length / chains.length >= 0.5;

  const nodeCanvasObject = useNodeCanvasObject(
    selectedNode,
    edges,
    images,
    resolvedTheme
  );
  const linkCanvasObject = useLinkCanvasObject(selectedNode, resolvedTheme);

  const filteredData = (toArray(data) as NetworkDataItem[]).filter(
    (d: NetworkDataItem) =>
      !selectedNode?.id ||
      find(selectedNode.id, [d.sourceChain, d.destinationChain])
  );

  return !data || !(graphData && imagesLoaded) ? (
    <Spinner />
  ) : (
    <div
      className={clsx(
        styles.grid,
        !hideTable ? styles.gridWithTable : styles.gridWithoutTable
      )}
    >
      <div className={styles.graphContainer}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ForceGraph2D
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={graphRef as any}
          graphData={{ nodes: nodes!, links: edges! }}
          width={648}
          height={632}
          backgroundColor={resolvedTheme === 'dark' ? '#18181b' : '#ffffff'}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...{ showNavInfo: false } as Record<string, any>}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodeCanvasObject={nodeCanvasObject as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          linkCanvasObject={linkCanvasObject as any}
          onNodeClick={(node: GraphNode) => {
            setSelectedNode(node);
            setPage(undefined);

            if (setChainFocus) {
              setChainFocus(node.id);
            }
          }}
          onLinkClick={() => {
            setSelectedNode(null);
            setPage(undefined);

            if (setChainFocus) {
              setChainFocus(null);
            }
          }}
          onBackgroundClick={() => {
            setSelectedNode(null);
            setPage(undefined);

            if (setChainFocus) {
              setChainFocus(null);
            }
          }}
          maxZoom={5}
          minZoom={5}
          cooldownTime={Infinity}
          enableZoomInteraction={true}
          enableNodeDrag={false}
        />
      </div>
      {!hideTable && (
        <div className={styles.tableWrapper}>
          <div className={styles.tableScrollContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.headerRow}>
                  <th
                    scope="col"
                    className={styles.thSource}
                  >
                    Source
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Destination
                  </th>
                  <th scope="col" className={styles.thRight}>
                    Transactions
                  </th>
                  <th scope="col" className={styles.thRight}>
                    Volume
                  </th>
                  <th
                    scope="col"
                    className={styles.thLast}
                  >
                    Volume / TX
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {filteredData
                  .filter(
                    (_d: NetworkDataItem, i: number) =>
                      i >= ((page ?? 1) - 1) * sizePerPage && i < (page ?? 1) * sizePerPage
                  )
                  .map((d: NetworkDataItem, i: number) => (
                    <tr
                      key={i}
                      className={styles.bodyRow}
                    >
                      <td className={styles.tdSource}>
                        <ChainProfile
                          value={d.sourceChain}
                          titleClassName={styles.profileTitle}
                        />
                      </td>
                      <td className={styles.tdDefault}>
                        <ChainProfile
                          value={d.destinationChain}
                          titleClassName={styles.profileTitle}
                        />
                      </td>
                      <td className={styles.tdRight}>
                        <div className={styles.cellContent}>
                          <Number
                            value={d.num_txs}
                            className={styles.numberValue}
                          />
                        </div>
                      </td>
                      <td className={styles.tdRight}>
                        <div className={styles.cellContent}>
                          <Number
                            value={d.volume}
                            format="0,0"
                            prefix="$"
                            noTooltip={true}
                            className={styles.numberValue}
                          />
                        </div>
                      </td>
                      <td className={styles.tdLast}>
                        <div className={styles.cellContent}>
                          <Number
                            value={(d.volume ?? 0) / d.num_txs}
                            prefix="$"
                            noTooltip={true}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {filteredData.length > sizePerPage && (
            <div className={styles.paginationWrapper}>
              <TablePagination
                data={filteredData}
                value={page}
                onChange={(page: number) => setPage(page)}
                sizePerPage={sizePerPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
