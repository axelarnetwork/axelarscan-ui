'use client';

export function Response({ data }) {
  const { code, message } = { ...data };

  return (
    <div className="flex flex-col gap-y-2">
      <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {code}
      </span>
      <span className="break-all text-sm font-normal text-zinc-400 dark:text-zinc-500 sm:break-normal">
        {message}
      </span>
    </div>
  );
}
