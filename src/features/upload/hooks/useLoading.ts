import simulateProgress from "@/utils/simulateProgress";
import { useState } from "react";
type LoadingType = {
  totalProgress: number;
  isLoading: boolean;
  setTotalProgress: (v: number) => void;
  setIsLoading: (b: boolean) => void;
};
const loading = ({
  setTotalProgress,
  totalProgress,
  setIsLoading,
  isLoading,
}: LoadingType) => {
  const step = simulateProgress(setTotalProgress);

  let interval: NodeJS.Timeout;

  const intervalFn = () => {
    if (totalProgress >= 100) {
      clearInterval(interval);
      setIsLoading(false);
    } else {
      const progress = step();
      setTotalProgress(progress);
    }
  };

  interval = setInterval(intervalFn, 500);

  return {
    isLoading,
    progress: totalProgress,
    clearLoading: () => {
      clearInterval(interval);
      if (totalProgress < 100) {
        interval = setInterval(intervalFn, 500);
      } else setIsLoading(false);
    },
  };
};

const useLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  return {
    loading: () =>
      loading({ isLoading, setIsLoading, setTotalProgress, totalProgress }),
  };
};

export default useLoading;
