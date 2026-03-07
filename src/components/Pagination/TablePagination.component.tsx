'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

import { Button } from '@/components/Button';
import { Number } from '@/components/Number';
import { isNumber, toNumber } from '@/lib/number';
import type { TablePaginationProps } from './Pagination.types';

export function TablePagination({
  data,
  value = 1,
  maxPage = 5,
  sizePerPage = 25,
  onChange,
}: TablePaginationProps) {
  const [page, setPage] = useState(value);

  useEffect(() => {
    if (value) {
      setPage(value);
    }
  }, [value, setPage]);

  useEffect(() => {
    if (page && onChange) {
      onChange(page);
    }
  }, [page, onChange]);

  const half = Math.floor(toNumber(maxPage) / 2);
  const totalPage = Math.ceil(toNumber(data.length) / sizePerPage);

  const pages = _.range(page - half, page + half + 1).filter(
    p => p > 0 && p <= totalPage
  );
  const prev = _.min(
    _.range((_.head(pages) ?? 0) - maxPage, _.head(pages) ?? 0).filter(
      p => p > 0
    )
  );
  const next = _.max(
    _.range(
      (_.last(pages) ?? 0) + 1,
      (_.last(pages) ?? 0) + maxPage + 1
    ).filter(p => p <= totalPage)
  );

  return (
    <div className="flex items-center justify-center gap-x-1">
      {isNumber(prev) && (
        <Button color="none" onClick={() => setPage(prev!)} className="!px-1">
          <MdKeyboardDoubleArrowLeft size={18} />
        </Button>
      )}
      {pages.map(p => (
        <Button
          key={p}
          color={p === page ? 'blue' : 'default'}
          onClick={() => setPage(p)}
          className="!px-3 !py-1 !text-2xs"
        >
          <Number value={p} />
        </Button>
      ))}
      {isNumber(next) && (
        <Button color="none" onClick={() => setPage(next!)} className="!px-1">
          <MdKeyboardDoubleArrowRight size={18} />
        </Button>
      )}
    </div>
  );
}
