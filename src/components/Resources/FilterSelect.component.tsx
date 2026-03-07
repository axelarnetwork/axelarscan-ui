import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { LuChevronsUpDown } from 'react-icons/lu';

import { split, toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { getQueryString } from '@/lib/operator';

import type { FilterSelectProps, SelectOption } from './Resources.types';
import { ButtonContent } from './ButtonContent.component';
import { OptionItem } from './OptionItem.component';
import * as styles from './Resources.styles';

export function FilterSelect({ attribute, params, resource }: FilterSelectProps) {
  const router = useRouter();
  const d = attribute;

  return (
    <Listbox
      value={d.multiple ? split(params[d.name]) : params[d.name]}
      onChange={(v: string | string[]) => {
        router.push(
          `/resources/${resource}${getQueryString({ ...params, [d.name]: d.multiple ? (v as string[]).join(',') : v as string })}`
        );
      }}
      multiple={d.multiple as true | undefined}
    >
      {({ open }) => {
        const isSelected = (v: string | undefined) =>
          d.multiple
            ? split(params[d.name]).includes(v ?? '')
            : v === params[d.name] || equalsIgnoreCase(v, params[d.name]);

        const selectedValue: SelectOption[] | SelectOption | undefined = d.multiple
          ? (toArray(d.options) as SelectOption[]).filter((o: SelectOption) => isSelected(o.value))
          : (toArray(d.options) as SelectOption[]).find((o: SelectOption) => isSelected(o.value));

        return (
          <div className={styles.selectRelative}>
            <Listbox.Button className={styles.selectButton}>
              <ButtonContent
                attribute={d}
                selectedValue={selectedValue}
                params={params}
                resource={resource}
              />
              <span className={styles.selectIconWrapper}>
                <LuChevronsUpDown size={20} className={styles.selectChevronIcon} />
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className={styles.selectOptions}>
                {(toArray(d.options) as SelectOption[]).map((o: SelectOption, j: number) => (
                  <OptionItem key={j} option={o} />
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        );
      }}
    </Listbox>
  );
}
