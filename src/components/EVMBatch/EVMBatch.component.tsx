'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { PiCheckCircleFill, PiXCircleFill } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { ExplorerLink } from '@/components/ExplorerLink';
import { useChains } from '@/hooks/useGlobalData';
import { Spinner } from '@/components/Spinner';
import { EVMWallet, useEVMWalletStore } from '@/components/Wallet';
import { getBatch } from '@/lib/api/token-transfer';
import { getChainData } from '@/lib/config';
import { parseError } from '@/lib/parser';
import { timeDiff } from '@/lib/time';

import { Info } from './Info.component';
import type {
  BatchCommand,
  BatchData,
  EVMBatchProps,
  ExecuteResponse,
} from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

const EXECUTE_PERIOD_SECONDS = 5 * 60;

export function EVMBatch({ chain, id }: EVMBatchProps) {
  const [data, setData] = useState<BatchData | null>(null);
  const [executing, setExecuting] = useState(false);
  const [response, setResponse] = useState<ExecuteResponse | null>(null);
  const chains = useChains();
  const { chainId, signer } = useEVMWalletStore();

  const { chain_id, gateway } = { ...getChainData(chain, chains) };

  const { commands, created_at, execute_data } = { ...data };
  const executed =
    commands &&
    commands.length === commands.filter((c: BatchCommand) => c.executed).length;

  useEffect(() => {
    const getData = async () => {
      const data = (await getBatch(chain, id)) as BatchData | null;

      setData(data);
    };

    getData();
  }, [chain, id, setData]);

  // toast
  useEffect(() => {
    const { status, message, hash } = { ...response };
    const _chainData = getChainData(chain, chains);

    toast.remove();

    if (!message) {
      return;
    }

    if (hash && _chainData?.explorer) {
      let icon;

      switch (status) {
        case 'success':
          icon = (
            <PiCheckCircleFill size={20} className={styles.toastIconSuccess} />
          );
          break;
        case 'failed':
          icon = <PiXCircleFill size={20} className={styles.toastIconFailed} />;
          break;
        default:
          break;
      }

      toast.custom(
        <div className={styles.toastWrapper}>
          <div className={styles.toastRow}>
            {icon}
            <span className={styles.toastMessage}>{message}</span>
          </div>
          <div className={styles.toastLinkRow}>
            <ExplorerLink
              value={hash}
              chain={chain}
              iconOnly={false}
              nonIconClassName={styles.toastExplorerLink}
            />
            <button
              onClick={() => setResponse(null)}
              className={styles.toastDismiss}
            >
              Dismiss
            </button>
          </div>
        </div>,
        { duration: 60000 }
      );
      return;
    }

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
  }, [chain, response, chains]);

  const execute = async () => {
    if (!execute_data || !signer) {
      return;
    }

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
  };

  const executeButton = data?.status === 'BATCHED_COMMANDS_STATUS_SIGNED' &&
    execute_data &&
    !executed &&
    timeDiff(created_at?.ms) > EXECUTE_PERIOD_SECONDS && (
      <div className={styles.executeButtonWrapper}>
        {signer && chain_id === chainId && (
          <button
            disabled={executing}
            onClick={() => execute()}
            className={clsx(
              styles.executeButtonBase,
              executing
                ? styles.executeButtonDisabled
                : styles.executeButtonEnabled
            )}
          >
            Execut{executing ? 'ing...' : 'e'}
          </button>
        )}
        {!executing && (
          <EVMWallet connectChainId={chain_id as number | undefined} />
        )}
      </div>
    );

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div className={styles.contentWrapper}>
        <Toaster />
        <Info data={data} chain={chain} id={id} executeButton={executeButton} />
      </div>
    </Container>
  );
}
