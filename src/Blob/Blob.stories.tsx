import type { Meta, StoryObj } from '@storybook/react-vite';
import { Blob, type BlobProps } from './Blob';

const range = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });

const Label = ({ children, color = '#fff' }: { children: string; color?: string }) => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100%', color, font: '600 28px/1.2 system-ui, sans-serif' }}>{children}</div>
);

const meta = {
  title: 'Layouts/Blob',
  component: Blob,
  parameters: { layout: 'fullscreen' },
  args: {
    blobs: 3,
    points: 6,
    randomness: 0.4,
    smoothness: 1,
    size: 0.7,
    speed: 1,
    rotate: 0,
    colors: ['#6366f1', '#14b8a6', '#f472b6'],
    gradient: true,
    stroke: '#ffffff',
    strokeWidth: 0,
    blur: 0,
    opacity: 0.85,
    seed: 1,
    background: '#0b1020',
    height: 420,
    width: '100%',
  },
  argTypes: {
    blobs: range(1, 8),
    points: range(3, 12),
    randomness: range(0, 1, 0.05),
    smoothness: range(0, 1.5, 0.05),
    size: range(0.2, 1, 0.05),
    speed: range(-4, 4, 0.1),
    rotate: range(-90, 90, 1),
    colors: { control: 'object' },
    gradient: { control: 'boolean' },
    stroke: { control: 'color' },
    strokeWidth: range(0, 6, 0.5),
    blur: range(0, 40, 1),
    opacity: range(0.1, 1, 0.05),
    seed: range(0, 99),
    background: { control: 'color' },
    height: range(200, 800, 10),
    width: { control: 'text' },
    className: { control: 'text' },
    style: { control: 'object' },
    children: { control: false },
  },
  render: (args: BlobProps) => (
    <Blob {...args}>
      <Label>Blob</Label>
    </Blob>
  ),
} satisfies Meta<typeof Blob>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Lava: Story = {
  args: {
    blobs: 4,
    points: 8,
    randomness: 0.55,
    colors: ['#f97316', '#e11d48', '#7c2d12'],
    blur: 18,
    opacity: 0.8,
    rotate: 6,
    seed: 12,
    background: '#1a0b0b',
  },
};

export const Outline: Story = {
  args: {
    blobs: 5,
    points: 7,
    randomness: 0.3,
    gradient: false,
    colors: ['transparent'],
    stroke: '#e2e8f0',
    strokeWidth: 1.5,
    opacity: 1,
    speed: 0.6,
    rotate: -8,
    seed: 5,
    background: '#0f172a',
  },
};

export const Pebble: Story = {
  args: {
    blobs: 1,
    points: 5,
    randomness: 0.2,
    size: 0.8,
    colors: ['#fde68a', '#fb7185'],
    speed: 0.5,
    background: '#fffbeb',
    opacity: 1,
    seed: 3,
  },
};
