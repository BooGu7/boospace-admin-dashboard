import { create } from "zustand";
import type { Mail } from "./data";

type Config = {
  selected: Mail["id"] | null;
};

type MailStore = {
  mail: Config;
  setMail: (mail: Config) => void;
};

const useMailStore = create<MailStore>((set) => ({
  mail: {
    selected: null,
  },
  setMail: (mail) => set({ mail }),
}));

export function useMail() {
  const mail = useMailStore((state) => state.mail);
  const setMail = useMailStore((state) => state.setMail);

  return [mail, setMail] as const;
}
