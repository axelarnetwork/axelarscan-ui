import _ from 'lodash';

import { isString } from '@/lib/string';
import { isNumber, toNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';

import type { GraphNode, GraphEdge, ImagesMap, TierConfig } from './NetworkGraph.types';

// ---------------------------------------------------------------------------
// Image preloading helpers
// ---------------------------------------------------------------------------

export const preloadImagePromise = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = img.onabort = () => reject();
    img.src = src;
    img.crossOrigin = 'anonymous';
  });

export const getImageAsync = async (url: string): Promise<HTMLImageElement | undefined> => {
  try {
    return await preloadImagePromise(url);
  } catch (error) {
    return;
  }
};

// ---------------------------------------------------------------------------
// Canvas drawing helpers
// ---------------------------------------------------------------------------

export const drawNode = (
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

export const drawTitle = (
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

export const drawNodeCanvasObject = (
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

// ---------------------------------------------------------------------------
// Comet drawing helpers
// ---------------------------------------------------------------------------

export const COMET_SPEED = 0.0033;
export const COMET_LENGTH = 3;

export const drawLine = (
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

export const calculateAndDrawComet = (
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

export const drawCommet = (link: GraphEdge, ctx: CanvasRenderingContext2D, theme: string | undefined) => {
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

export const drawLinkCanvasObject = (
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

// ---------------------------------------------------------------------------
// Statistical helpers
// ---------------------------------------------------------------------------

export const TIERS: TierConfig[] = [
  { id: 1, n_sd: 0.25 },
  { id: 2, n_sd: -0.25 },
  { id: 3, n_sd: null },
];

export const MEAN = (data: GraphNode[], field: string = 'num_txs'): number =>
  _.mean(toArray(data).map(d => toNumber(d[field as keyof GraphNode])));

export const SD = (data: GraphNode[], field: string = 'num_txs'): number => {
  const items = toArray(data) as GraphNode[];

  if (items.length === 0) {
    return 0;
  }

  return Math.sqrt(
    _.sum(items.map(d => Math.pow(toNumber(d[field as keyof GraphNode]) - MEAN(items, field), 2))) /
      items.length
  );
};

export const THRESHOLD = (data: GraphNode[], n_sd: number | null, field: string = 'num_txs'): number =>
  !isNumber(n_sd) ? 0 : MEAN(data, field) + (n_sd as number) * SD(data, field);

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const SIZE_PER_PAGE = 10;
