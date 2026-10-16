import type { Meta, StoryObj } from '@storybook/react-vite';
import { Contours, type ContoursProps } from './Contours';

const range = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });

const Label = ({ children, color = '#fff' }: { children: string; color?: string }) => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100%', color, font: '600 28px/1.2 system-ui, sans-serif' }}>{children}</div>
);

const meta = {
  title: 'Layouts/Contours',
  component: Contours,
  parameters: { layout: 'fullscreen' },
  args: {
    levels: 12,
    scale: 240,
    speed: 1,
    lineWidth: 1,
    colors: ['#1d3b5c', '#3f87a6', '#b8e0d2'],
    background: '#0a0f1c',
    smooth: true,
    resolution: 10,
    fill: false,
    seed: 1,
    height: 420,
    width: '100%',
  },
  argTypes: {
    levels: range(1, 40),
    scale: range(60, 600, 10),
    speed: range(-4, 4, 0.1),
    lineWidth: range(0, 5, 0.25),
    colors: { control: 'object' },
    background: { control: 'color' },
    smooth: { control: 'boolean' },
    resolution: range(4, 40),
    fill: { control: 'boolean' },
    seed: range(0, 99),
    height: range(200, 800, 10),
    width: { control: 'text' },
    className: { control: 'text' },
    style: { control: 'object' },
    children: { control: false },
  },
  render: (args: ContoursProps) => (
    <Contours {...args}>
      <Label>Contours</Label>
    </Contours>
  ),
} satisfies Meta<typeof Contours>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Topographic: Story = {};

export const Paper: Story = {
  args: {
    levels: 16,
    scale: 320,
    speed: 0.6,
    lineWidth: 1,
    colors: ['#6b5b4b', '#a8927c'],
    background: '#f3ede2',
    seed: 8,
  },
};

export const Bands: Story = {
  args: {
    levels: 8,
    fill: true,
    lineWidth: 0,
    resolution: 14,
    colors: ['#0f2a3f', '#1f6f78', '#7cc4a8', '#f1e7b6'],
    background: '#0a1a28',
    speed: 0.8,
    seed: 3,
  },
};

export const Ember: Story = {
  args: {
    levels: 20,
    scale: 180,
    speed: 1.2,
    lineWidth: 1.25,
    colors: ['#3b0d0d', '#c2410c', '#fbbf24'],
    background: '#120707',
    resolution: 8,
    seed: 14,
  },
};
