import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { TablePagination } from '@/components/Pagination';

import { networkGraphStyles as styles } from './NetworkGraph.styles';
import type { NetworkDataItem } from './NetworkGraph.types';
import { SIZE_PER_PAGE } from './NetworkGraph.utils';

interface NetworkGraphTableProps {
  filteredData: NetworkDataItem[];
  page: number | undefined;
  setPage: (page: number | undefined) => void;
}

export function NetworkGraphTable({ filteredData, page, setPage }: NetworkGraphTableProps) {
  const paginatedData = filteredData.filter(
    (_d: NetworkDataItem, i: number) =>
      i >= ((page ?? 1) - 1) * SIZE_PER_PAGE && i < (page ?? 1) * SIZE_PER_PAGE
  );

  return (
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
            {paginatedData.map((d: NetworkDataItem, i: number) => (
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
      {filteredData.length > SIZE_PER_PAGE && (
        <div className={styles.paginationWrapper}>
          <TablePagination
            data={filteredData}
            value={page}
            onChange={(page: number) => setPage(page)}
            sizePerPage={SIZE_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
}
