import _ from 'lodash';

import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { Switch } from '@/components/Switch';
import { ChainWithTotalValue, ProcessedTVLData } from './TVL.types';
import {
  getSwitchTitleClass,
  switchStyles,
  tableHeaderStyles,
} from './TVLTableHeader.styles';

interface TVLTableHeaderProps {
  includeITS: boolean;
  onToggleITS: (value: boolean) => void;
  filteredData: ProcessedTVLData[];
  chainsTVL: ChainWithTotalValue[] | null;
}

/**
 * Table header for the TVL table
 * Includes column headers with summary values and chain columns
 */
export function TVLTableHeader({
  includeITS,
  onToggleITS,
  filteredData,
  chainsTVL,
}: TVLTableHeaderProps) {
  const totalLockedValue = _.sumBy(
    filteredData.filter((d: ProcessedTVLData) => d.value > 0),
    'value'
  );

  const totalEVMValue = _.sumBy(
    filteredData.filter((d: ProcessedTVLData) => d.value_on_evm > 0),
    'value_on_evm'
  );

  const totalCosmosValue = _.sumBy(
    filteredData.filter((d: ProcessedTVLData) => d.value_on_cosmos > 0),
    'value_on_cosmos'
  );

  return (
    <thead className={tableHeaderStyles.thead}>
      <tr className={tableHeaderStyles.headerRow}>
        <th scope="col" className={tableHeaderStyles.headerCell.left}>
          <div className={tableHeaderStyles.columnContent.base}>
            <span className={tableHeaderStyles.columnLabel}>Asset</span>
            <Switch
              value={includeITS}
              onChange={onToggleITS}
              title="Including ITS"
              groupClassName={switchStyles.group}
              outerClassName={switchStyles.outer}
              innerClassName={switchStyles.inner}
              labelClassName={switchStyles.label}
              titleClassName={getSwitchTitleClass(includeITS)}
            />
          </div>
        </th>
        <th scope="col" className={tableHeaderStyles.headerCell.leftNoWrap}>
          <div className={tableHeaderStyles.columnContent.base}>
            <span className={tableHeaderStyles.columnLabel}>Native Chain</span>
            <div className={tableHeaderStyles.spacer} />
          </div>
        </th>
        <th scope="col" className={tableHeaderStyles.headerCell.right}>
          <div className={tableHeaderStyles.columnContent.alignEnd}>
            <span className={tableHeaderStyles.columnLabel}>Total Locked</span>
            <Number
              value={totalLockedValue}
              format="0,0.00a"
              prefix="$"
              noTooltip={true}
              className={tableHeaderStyles.summaryNumber}
            />
          </div>
        </th>
        <th scope="col" className={tableHeaderStyles.headerCell.right}>
          <div className={tableHeaderStyles.columnContent.alignEnd}>
            <span className={tableHeaderStyles.columnLabel}>Moved to EVM</span>
            <Number
              value={totalEVMValue}
              format="0,0.00a"
              prefix="$"
              noTooltip={true}
              className={tableHeaderStyles.summaryNumber}
            />
          </div>
        </th>
        <th scope="col" className={tableHeaderStyles.headerCell.right}>
          <div className={tableHeaderStyles.columnContent.alignEnd}>
            <span className={tableHeaderStyles.columnLabel}>
              Moved to Cosmos
            </span>
            <Number
              value={totalCosmosValue}
              format="0,0.00a"
              prefix="$"
              noTooltip={true}
              className={tableHeaderStyles.summaryNumber}
            />
          </div>
        </th>
        {chainsTVL?.map((chain: ChainWithTotalValue) => (
          <th
            key={chain.id}
            scope="col"
            className={tableHeaderStyles.headerCell.right}
          >
            <div className={tableHeaderStyles.columnContent.alignEnd}>
              <div className={tableHeaderStyles.chainHeader}>
                <Image src={chain.image} alt="" width={18} height={18} />
                <span className={tableHeaderStyles.columnLabel}>
                  {chain.name}
                </span>
              </div>
              <Number
                value={chain.total_value}
                format="0,0.0a"
                prefix="$"
                noTooltip={true}
                className={tableHeaderStyles.chainValue}
              />
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}
