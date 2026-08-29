import type { DefineComponent } from 'vue'

export interface ButtonProps {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  icon?: string
}

export interface CardProps {
  title?: string
  shadow?: 'always' | 'hover' | 'never'
  padding?: number | string
}

export interface TagProps {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'medium' | 'large'
  closable?: boolean
  effect?: 'light' | 'dark' | 'plain'
}

export type OmButton = DefineComponent<ButtonProps>
export type OmCard = DefineComponent<CardProps>
export type OmTag = DefineComponent<TagProps>
