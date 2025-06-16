export type ProgressType = {
  setProgress: (v: number) => void;
};
function simulateProgress(setProgress: (v: number) => void): () => number {
  const max = 80;
  const part = 100; // how much each file contributes

  let progress = 5;
  let totalProgress = 0;

  const step = (): number => {
    if (totalProgress <= max) {
      progress += Math.floor(Math.random() * 10) + 5; // +5~15
      totalProgress = Math.floor(totalProgress + (progress / 100) * part);
    } else {
      totalProgress = 100;
      //   clearInterval(interval);
    }
    // final progress = base + (this file's percentage * its part)
    setProgress(totalProgress);
    return totalProgress;
  };

  //   interval = setInterval(step, 500);

  return step;
}

export default simulateProgress;
