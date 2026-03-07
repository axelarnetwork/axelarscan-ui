'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import ForceGraph2D from 'react-force-graph-2d';
import type { ForceGraphMethods } from 'react-force-graph-2d';
import clsx from 'clsx';
import _ from 'lodash';

import { Spinner } from '@/components/Spinner';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';

import { networkGraphStyles as styles } from './NetworkGraph.styles';
import type {
  NetworkGraphProps,
  NetworkDataItem,
  GraphNode,
  GraphEdge,
  GraphData,
} from './NetworkGraph.types';
import { TIERS, THRESHOLD } from './NetworkGraph.utils';
import { useImagePreloader, useNodeCanvasObject, useLinkCanvasObject } from './NetworkGraph.hooks';
import { NetworkGraphTable } from './Table.component';

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

  if (!data || !(graphData && imagesLoaded)) {
    return <Spinner />;
  }

  return (
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
        <NetworkGraphTable
          filteredData={filteredData}
          page={page}
          setPage={setPage}
        />
      )}
    </div>
  );
}
