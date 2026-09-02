import type { ModelContext } from "@a11ysync/core";

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  interface Navigator {
    modelContext?: ModelContext;
  }
}

declare module "react" {
  interface FormHTMLAttributes<T> extends React.HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
    "tool-name"?: string;
    "tool-description"?: string;
    toolautosubmit?: string | boolean;
  }
}
