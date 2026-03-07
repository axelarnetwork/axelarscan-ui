import { useCallback, useEffect, useState } from 'react';

import type { GraphNode, GraphEdge, ImagesMap } from './NetworkGraph.types';
import { getImageAsync, drawNodeCanvasObject, drawLinkCanvasObject } from './NetworkGraph.utils';

// ---------------------------------------------------------------------------
// useImagePreloader
// ---------------------------------------------------------------------------

export const useImagePreloader = (images: string[]): ImagesMap => {
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
// useNodeCanvasObject
// ---------------------------------------------------------------------------

export const useNodeCanvasObject = (
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

// ---------------------------------------------------------------------------
// useLinkCanvasObject
// ---------------------------------------------------------------------------

export const useLinkCanvasObject = (selectedNode: GraphNode | null, theme: string | undefined) =>
  useCallback(
    (value: GraphEdge, ctx: CanvasRenderingContext2D, globalScale: number) =>
      drawLinkCanvasObject(value, ctx, globalScale, selectedNode, theme),
    [selectedNode, theme]
  );
