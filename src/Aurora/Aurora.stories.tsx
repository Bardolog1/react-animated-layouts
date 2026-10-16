import type { Meta, StoryObj } from '@storybook/react-vite';
import { Aurora, type AuroraProps } from './Aurora';

const range = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });

const Label = ({ children, color = '#fff' }: { children: string; color?: string }) => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100%', color, font: '600 28px/1.2 system-ui, sans-serif' }}>{children}</div>
);

const meta = {
  title: 'Layouts/Aurora',
  component: Aurora,
  parameters: { layout: 'fullscreen' },
  args: {
    colors: ['#34d399', '#22d3ee', '#a78bfa'],
    ribbons: 3,
    blur: 14,
    speed: 1,
    intensity: 0.8,
    amplitude: 46,
    rays: true,
    stars: true,
    skew: 6,
    background: ['#04060f', '#0a1428', '#10283a'],
    seed: 1,
    height: 460,
    width: '100%',
  },
  argTypes: {
    colors: { control: 'object' },
    ribbons: range(1, 8),
    blur: range(0, 40, 1),
    speed: range(-4, 4, 0.1),
    intensity: range(0, 1, 0.05),
    amplitude: range(0, 120, 2),
    rays: { control: 'boolean' },
    stars: { control: 'boolean' },
    skew: range(-30, 30, 1),
    background: { control: 'object' },
    seed: range(0, 99),
    height: range(200, 800, 10),
    width: { control: 'text' },
    className: { control: 'text' },
    style: { control: 'object' },
    children: { control: false },
  },
  render: (args: AuroraProps) => (
    <Aurora {...args}>
      <Label>Aurora</Label>
    </Aurora>
  ),
} satisfies Meta<typeof Aurora>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Borealis: Story = {};

export const Polar: Story = {
  args: {
    colors: ['#5eead4', '#38bdf8', '#e0f2fe'],
    ribbons: 4,
    blur: 20,
    amplitude: 30,
    skew: 0,
    rays: 40,
    background: ['#02060d', '#06182b'],
    speed: 0.7,
    seed: 4,
  },
};

export const Magenta: Story = {
  args: {
    colors: ['#f472b6', '#c084fc', '#60a5fa'],
    ribbons: 3,
    amplitude: 70,
    skew: -10,
    intensity: 0.9,
    stars: 120,
    background: ['#0b0614', '#1b0f33', '#2a1646'],
    seed: 9,
  },
};

export const Soft: Story = {
  args: {
    colors: ['#a7f3d0', '#bfdbfe'],
    ribbons: 2,
    blur: 30,
    intensity: 0.55,
    rays: false,
    stars: false,
    speed: 0.5,
    background: '#0c1a26',
    seed: 2,
  },
};
