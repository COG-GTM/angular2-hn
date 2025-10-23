interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="p-8 text-center">
      <p className="text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}
