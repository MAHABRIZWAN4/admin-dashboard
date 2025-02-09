declare module 'sweetalert2' {
  export function fire(options: {
    title: string;
    text: string;
    icon: 'warning' | 'error' | 'success' | 'info' | 'question';
    showCancelButton?: boolean;
    confirmButtonColor?: string;
    cancelButtonColor?: string;
    confirmButtonText?: string;
  }): Promise<{ isConfirmed: boolean }>;

  export function fire(
    title: string,
    text?: string,
    icon?: 'warning' | 'error' | 'success' | 'info' | 'question'
  ): Promise<{ isConfirmed: boolean }>;
}
