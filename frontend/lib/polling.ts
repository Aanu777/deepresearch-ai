export function startPolling(
  callback: () => Promise<void>,
  interval = 1000
) {
  callback();

  const id = setInterval(() => {
    callback();
  }, interval);

  return () => clearInterval(id);
}