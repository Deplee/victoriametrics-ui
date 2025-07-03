/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_SELECT_NODES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 