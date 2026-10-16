import type { Meta, StoryObj } from '@storybook/react-vite';
import { Gradient, type GradientProps } from './Gradient';

const range = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });

const Label = ({ children, color = '#fff' }: { children: string; color?: string }) => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100%', color, font: '600 28px/1.2 system-ui, sans-serif' }}>{children}</div>
);

const meta = {
  title: 'Layouts/Gradient',
  component: Gradient,
  parameters: { layout: 'fullscreen' },
  args: {
    type: 'linear',
    colors: ['#1d2b64', '#5b3f9e', '#d4719a', '#f6b983'],
    angle: 135,
    speed: 1,
    easing: 'ease-in-out',
    grain: 0.12,
    opacity: 1,
    blobs: 5,
    seed: 1,
    height: 420,
    width: '100%',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['linear', 'radial', 'conic', 'mesh'] },
    colors: { control: 'object' },
    angle: range(0, 360, 5),
    stops: { control: 'object' },
    speed: range(-4, 4, 0.1),
    easing: { control: 'select', options: ['ease-in-out', 'ease', 'linear', 'ease-in', 'ease-out', 'cubic-bezier(0.65, 0, 0.35, 1)'] },
    grain: range(0, 1, 0.01),
    blend: {
      control: 'select',
      options: [undefined, 'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'difference'],
    },
    opacity: range(0, 1, 0.05),
    blobs: range(1, 12),
    background: { control: 'color' },
    seed: range(0, 99),
    height: range(200, 800, 10),
    width: { control: 'text' },
    className: { control: 'text' },
    style: { control: 'object' },
    children: { control: false },
  },
  render: (args: GradientProps) => (
    <Gradient {...args}>
      <Label>Gradient</Label>
    </Gradient>
  ),
} satisfies Meta<typeof Gradient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dusk: Story = {};

export const Mesh: Story = {
  args: {
    type: 'mesh',
    colors: ['#6366f1', '#f472b6', '#fbbf24', '#34d399'],
    blobs: 6,
    background: '#0f172a',
    grain: 0.18,
    speed: 0.8,
    seed: 5,
  },
};

export const Conic: Story = {
  args: {
    type: 'conic',
    colors: ['#0f172a', '#1e3a8a', '#7dd3fc', '#1e3a8a'],
    angle: 40,
    speed: 0.6,
    grain: 0.1,
  },
};

export const Radial: Story = {
  args: {
    type: 'radial',
    colors: ['#fef3c7', '#fb923c', '#9a3412', '#1c0a05'],
    stops: [0, 25, 60, 100],
    angle: 200,
    speed: 0.7,
    grain: 0.2,
  },
};
