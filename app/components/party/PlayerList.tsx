interface PlayerListProps {
  children: React.ReactNode;
}

export function PlayerList({ children }: PlayerListProps) {
  return (
    <div className="max-h-[600px] w-full max-w-md overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/50 p-2">
      <ul className="flex flex-col gap-2">
        {children}
      </ul>
    </div>
  );
}