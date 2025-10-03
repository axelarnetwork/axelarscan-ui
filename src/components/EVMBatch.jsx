'use client';

import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { MdOutlineArrowBack, MdOutlineCode } from 'react-icons/md';
import { PiCheckCircleFill, PiXCircleFill } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { Copy } from '@/components/Copy';
import { ExplorerLink } from '@/components/ExplorerLink';
import { useGlobalStore } from '@/components/Global';
import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { ChainProfile, Profile } from '@/components/Profile';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Tooltip } from '@/components/Tooltip';
import { EVMWallet, useEVMWalletStore } from '@/components/Wallet/Wallet';
import { getBatch } from '@/lib/api/token-transfer';
import { getAssetData, getChainData } from '@/lib/config';
import { formatUnits, toNumber } from '@/lib/number';
import { parseError, split, toArray, toCase } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import { TIME_FORMAT, timeDiff } from '@/lib/time';

function Info({ data, chain, id, executeButton }) {
  const { chains, assets } = useGlobalStore();

  const {
    key_id,
    commands,
    created_at,
    execute_data,
    prev_batched_commands_id,
  } = { ...data };
  let { signatures } = { ...data?.proof };

  signatures = toArray(signatures || data?.signature);

  const { gateway, explorer } = { ...getChainData(chain, chains) };
  const { url, address_path, transaction_path } = { ...explorer };

  const executed =
    commands && commands.length === commands.filter(c => c.executed).length;
  const status = executed
    ? 'executed'
    : toCase(data?.status?.replace('BATCHED_COMMANDS_STATUS_', ''), 'lower');

  return (
    <div className="overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100">
          <Copy value={id}>
            <span>{ellipse(id, 16)}</span>
          </Copy>
          {key_id && (
            <Copy size={16} value={key_id}>
              <span className="text-sm font-normal leading-6 text-zinc-400 dark:text-zinc-500">
                {key_id}
              </span>
            </Copy>
          )}
        </h3>
        <div className="mt-3 max-w-2xl">
          {prev_batched_commands_id && (
            <Link
              href={`/evm-batch/${chain}/${prev_batched_commands_id}`}
              className="flex items-center gap-x-1 font-medium text-blue-600 dark:text-blue-500"
            >
              <MdOutlineArrowBack size={18} />
              <span>
                Previous Batch ({ellipse(prev_batched_commands_id, 8)})
              </span>
            </Link>
          )}
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Chain
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0">
              {url && gateway?.ddress ? (
                <Link
                  href={`${url}${address_path?.replace('{address}', gateway.ddress)}`}
                  target="_blank"
                >
                  <ChainProfile value={chain} />
                </Link>
              ) : (
                <ChainProfile value={chain} />
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Status
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0">
              {status && (
                <div className="flex items-center space-x-3">
                  <Tag
                    className={clsx(
                      'w-fit capitalize',
                      ['executed'].includes(status)
                        ? 'bg-green-600 dark:bg-green-500'
                        : ['signed'].includes(status)
                          ? 'bg-orange-500 dark:bg-orange-600'
                          : ['signing'].includes(status)
                            ? 'bg-yellow-400 dark:bg-yellow-500'
                            : 'bg-red-600 dark:bg-red-500'
                    )}
                  >
                    {status}
                  </Tag>
                  {executeButton}
                </div>
              )}
            </dd>
          </div>
          {commands && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{`Command${commands.length > 1 ? `s (${commands.length})` : ''}`}</dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0">
                <div className="-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
                  <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                    <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                      <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        <th
                          scope="col"
                          className="py-2.5 pl-4 pr-3 text-left sm:pl-3"
                        >
                          ID
                        </th>
                        <th scope="col" className="px-3 py-2.5 text-left">
                          Command
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2.5 pl-3 pr-4 text-left sm:pr-3"
                        >
                          Parameters
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                      {commands.map((c, i) => {
                        const { type, deposit_address } = { ...c };
                        const {
                          amount,
                          name,
                          cap,
                          account,
                          salt,
                          newOwners,
                          newOperators,
                          newWeights,
                          newThreshold,
                          sourceChain,
                          sourceTxHash,
                          contractAddress,
                        } = { ...c.params };
                        let { symbol, decimals } = { ...c.params };

                        const transferID = parseInt(c.id, 16);
                        const assetData = getAssetData(symbol, assets);

                        symbol =
                          assetData?.addresses?.[chain]?.symbol ||
                          assetData?.symbol ||
                          symbol;
                        decimals =
                          assetData?.addresses?.[chain]?.decimals ||
                          assetData?.decimals ||
                          decimals ||
                          18;
                        const image =
                          assetData?.addresses?.[chain]?.image ||
                          assetData?.image;

                        const sourceChainData = getChainData(
                          sourceChain,
                          chains
                        );
                        const destinationChainData = getChainData(
                          chain,
                          chains
                        );

                        const IDElement = (
                          <span className="font-medium">
                            {ellipse(c.id, 6)}
                          </span>
                        );

                        const typeElement = (
                          <div className="flex">
                            <Tooltip
                              content={c.executed ? 'Executed' : 'Unexecuted'}
                            >
                              <Tag
                                className={clsx(
                                  'w-fit text-2xs capitalize',
                                  c.executed
                                    ? 'bg-green-600 dark:bg-green-500'
                                    : 'bg-orange-500 dark:bg-orange-600'
                                )}
                              >
                                {type}
                              </Tag>
                            </Tooltip>
                          </div>
                        );

                        return (
                          <tr
                            key={i}
                            className="align-top text-xs text-zinc-400 dark:text-zinc-500"
                          >
                            <td className="py-3 pl-4 pr-3 text-left sm:pl-3">
                              {url && c.transactionHash ? (
                                <Copy size={16} value={c.id}>
                                  <Link
                                    href={`${url}${transaction_path?.replace('{tx}', c.transactionHash)}`}
                                    target="_blank"
                                    className="text-blue-600 dark:text-blue-500"
                                  >
                                    {IDElement}
                                  </Link>
                                </Copy>
                              ) : (
                                <Copy size={16} value={c.id}>
                                  {IDElement}
                                </Copy>
                              )}
                            </td>
                            <td className="px-3 py-3 text-left">
                              {url && c.transactionHash ? (
                                <Link
                                  href={`${url}${transaction_path?.replace('{tx}', c.transactionHash)}`}
                                  target="_blank"
                                >
                                  {typeElement}
                                </Link>
                              ) : (
                                typeElement
                              )}
                            </td>
                            <td className="py-3 pl-3 pr-4 text-left sm:pr-3">
                              <div className="flex lg:flex-wrap lg:items-center">
                                {symbol &&
                                  !['approveContractCall'].includes(type) && (
                                    <div className="mr-2 flex h-6 min-w-fit items-center gap-x-1.5 rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
                                      <Image
                                        src={image}
                                        alt=""
                                        width={16}
                                        height={16}
                                      />
                                      {amount && assets ? (
                                        <Number
                                          value={formatUnits(amount, decimals)}
                                          format="0,0.000000"
                                          suffix={` ${symbol}`}
                                          className="text-xs font-medium text-zinc-900 dark:text-zinc-100"
                                        />
                                      ) : (
                                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                          {symbol}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                {sourceChainData && (
                                  <div className="mr-2 flex h-6 min-w-fit items-center gap-x-1.5">
                                    {sourceTxHash && (
                                      <Link
                                        href={`/gmp/${sourceTxHash}${sourceChainData.chain_type === 'cosmos' && c.id ? `?commandId=${c.id}` : ''}`}
                                        target="_blank"
                                        className="font-medium text-blue-600 dark:text-blue-500"
                                      >
                                        GMP
                                      </Link>
                                    )}
                                    <Tooltip
                                      content={sourceChainData.name}
                                      className="whitespace-nowrap"
                                    >
                                      <Image
                                        src={sourceChainData.image}
                                        alt=""
                                        width={20}
                                        height={20}
                                      />
                                    </Tooltip>
                                    {contractAddress && (
                                      <>
                                        <MdOutlineCode
                                          size={20}
                                          className="text-zinc-700 dark:text-zinc-300"
                                        />
                                        {destinationChainData && (
                                          <Tooltip
                                            content={destinationChainData.name}
                                            className="whitespace-nowrap"
                                          >
                                            <Image
                                              src={destinationChainData.image}
                                              alt=""
                                              width={20}
                                              height={20}
                                            />
                                          </Tooltip>
                                        )}
                                        <Profile
                                          address={contractAddress}
                                          chain={chain}
                                          width={20}
                                          height={20}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}
                                {type === 'mintToken' && (
                                  <div className="mr-2 flex h-6 min-w-fit items-center gap-x-1.5">
                                    <Link
                                      href={`/transfer?transferId=${transferID}`}
                                      target="_blank"
                                      className="font-medium text-blue-600 dark:text-blue-500"
                                    >
                                      Transfer
                                    </Link>
                                    {account && (
                                      <>
                                        <MdOutlineCode
                                          size={20}
                                          className="text-zinc-700 dark:text-zinc-300"
                                        />
                                        <Profile
                                          address={account}
                                          chain={chain}
                                          width={20}
                                          height={20}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}
                                {salt && (
                                  <div className="mr-2 flex h-6 items-center gap-x-1.5">
                                    <span className="text-zinc-400 dark:text-zinc-500">
                                      {deposit_address
                                        ? 'Deposit address'
                                        : 'Salt'}
                                      :
                                    </span>
                                    {deposit_address ? (
                                      <Copy size={16} value={deposit_address}>
                                        <Link
                                          href={`/account/${deposit_address}`}
                                          target="_blank"
                                          className="text-zinc-400 dark:text-zinc-500"
                                        >
                                          {ellipse(deposit_address, 6, '0x')}
                                        </Link>
                                      </Copy>
                                    ) : (
                                      <Copy size={16} value={salt}>
                                        <span className="text-zinc-400 dark:text-zinc-500">
                                          {ellipse(salt, 6, '0x')}
                                        </span>
                                      </Copy>
                                    )}
                                  </div>
                                )}
                                {name && (
                                  <div className="mr-2 flex flex-col">
                                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                      {name}
                                    </span>
                                    <div className="flex items-center gap-x-2">
                                      {decimals > 0 && (
                                        <Number
                                          value={decimals}
                                          prefix="Decimals: "
                                          className="text-xs text-zinc-400 dark:text-zinc-500"
                                        />
                                      )}
                                      {cap > 0 && (
                                        <Number
                                          value={cap}
                                          prefix="Cap: "
                                          className="text-xs text-zinc-400 dark:text-zinc-500"
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                                {newOwners && (
                                  <Number
                                    value={
                                      split(newOwners, { delimiter: ';' })
                                        .length
                                    }
                                    suffix={' New Owners'}
                                    className="mr-2 h-6 rounded-xl bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                  />
                                )}
                                {newOperators && (
                                  <div className="mr-2 flex items-center">
                                    <Number
                                      value={
                                        split(newOperators, { delimiter: ';' })
                                          .length
                                      }
                                      suffix={' New Operators'}
                                      className="mr-2 h-6 rounded-xl bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                    />
                                    {newWeights && (
                                      <Number
                                        value={_.sum(
                                          split(newWeights, {
                                            delimiter: ';',
                                          }).map(w => toNumber(w))
                                        )}
                                        prefix="["
                                        suffix="]"
                                        className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                                      />
                                    )}
                                  </div>
                                )}
                                {newThreshold && (
                                  <Number
                                    value={newThreshold}
                                    prefix={'Threshold: '}
                                    className="mr-2 text-xs font-medium"
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </dd>
            </div>
          )}
          <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Time
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0">
              {created_at?.ms && moment(created_at.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {executed ? 'Signed Commands' : 'Execute Data'}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0">
              {execute_data && (
                <div className="flex items-start gap-x-2">
                  <Tag className="break-all bg-white px-3 py-3 font-sans text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
                    {ellipse(execute_data, 256)}
                  </Tag>
                  <Copy value={execute_data} className="mt-3" />
                </div>
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Data
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0">
              {data?.data && (
                <div className="flex items-start gap-x-2">
                  <Tag className="break-all bg-white px-3 py-3 font-sans text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
                    {ellipse(data.data, 256)}
                  </Tag>
                  <Copy value={data.data} className="mt-3" />
                </div>
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{`Signature${signatures.length > 1 ? `s (${signatures.length})` : ''}`}</dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0">
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
                {signatures.map((d, i) => (
                  <Copy key={i} size={14} value={d}>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {ellipse(d, 8)}
                    </span>
                  </Copy>
                ))}
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const EXECUTE_PERIOD_SECONDS = 5 * 60;

export function EVMBatch({ chain, id }) {
  const [data, setData] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [response, setResponse] = useState(null);
  const { chains } = useGlobalStore();
  const { chainId, signer } = useEVMWalletStore();

  const { chain_id, gateway } = { ...getChainData(chain, chains) };

  const { commands, created_at, execute_data } = { ...data };
  const executed =
    commands && commands.length === commands.filter(c => c.executed).length;

  useEffect(() => {
    const getData = async () => {
      const data = await getBatch(chain, id);

      console.log('[data]', data);
      setData(data);
    };

    getData();
  }, [chain, id, setData]);

  // toast
  useEffect(() => {
    const { status, message, hash } = { ...response };
    const chainData = getChainData(chain, chains);

    toast.remove();

    if (message) {
      if (hash && chainData?.explorer) {
        let icon;

        switch (status) {
          case 'success':
            icon = <PiCheckCircleFill size={20} className="text-green-600" />;
            break;
          case 'failed':
            icon = <PiXCircleFill size={20} className="text-red-600" />;
            break;
          default:
            break;
        }

        toast.custom(
          <div className="flex flex-col gap-y-1 rounded-lg bg-white px-3 py-2.5 shadow-lg sm:gap-y-0">
            <div className="flex items-center gap-x-1.5 sm:gap-x-2">
              {icon}
              <span className="text-zinc-700">{message}</span>
            </div>
            <div className="ml-6 flex items-center justify-between gap-x-4 pl-0.5 sm:ml-7 sm:pl-0">
              <ExplorerLink
                value={hash}
                chain={chain}
                iconOnly={false}
                nonIconClassName="text-zinc-700 text-xs sm:text-sm"
              />
              <button
                onClick={() => setResponse(null)}
                className="text-xs font-light text-zinc-400 underline sm:text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>,
          { duration: 60000 }
        );
      } else {
        const duration = 10000;

        switch (status) {
          case 'pending':
            toast.loading(message);
            break;
          case 'success':
            toast.success(message, { duration });
            break;
          case 'failed':
            toast.error(message, { duration });
            break;
          default:
            break;
        }
      }
    }
  }, [chain, response, chains]);

  const execute = async () => {
    if (execute_data && signer) {
      setExecuting(true);
      setResponse({ status: 'pending', message: 'Executing...' });

      try {
        const { hash } = {
          ...(await signer.sendTransaction({
            to: gateway?.address,
            data: `0x${execute_data}`,
          })),
        };

        setResponse({
          status: 'pending',
          message: 'Wait for Confirmation',
          hash,
        });

        const { status } = {
          ...(hash && (await signer.provider.waitForTransaction(hash))),
        };

        setResponse({
          status: status ? 'success' : 'failed',
          message: status ? 'Execute successful' : 'Failed to execute',
          hash,
        });
      } catch (error) {
        setResponse({ status: 'failed', ...parseError(error) });
      }

      setExecuting(false);
    }
  };

  const executeButton = data?.status === 'BATCHED_COMMANDS_STATUS_SIGNED' &&
    execute_data &&
    !executed &&
    timeDiff(created_at?.ms) > EXECUTE_PERIOD_SECONDS && (
      <div className="flex items-center gap-x-2">
        {signer && chain_id === chainId && (
          <button
            disabled={executing}
            onClick={() => execute()}
            className={clsx(
              'flex h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1 font-display text-white',
              executing
                ? 'pointer-events-none bg-blue-400 dark:bg-blue-400'
                : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
            )}
          >
            Execut{executing ? 'ing...' : 'e'}
          </button>
        )}
        {!executing && <EVMWallet connectChainId={chain_id} />}
      </div>
    );

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div className="max-w-5xl">
          <Toaster />
          <Info
            data={data}
            chain={chain}
            id={id}
            executeButton={executeButton}
          />
        </div>
      )}
    </Container>
  );
}
