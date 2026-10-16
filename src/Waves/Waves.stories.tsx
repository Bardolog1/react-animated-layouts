import type { Meta, StoryObj } from '@storybook/react-vite';
import { Waves } from './Waves';

const range = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });

const meta = {
  title: 'Layouts/Waves',
  component: Waves,
  parameters: { layout: 'fullscreen' },
  args: {
    colors: ['#38bdf8', '#0ea5e9', '#0369a1'],
    height: 160,
    width: '100%',
    amplitude: 20,
    frequency: 2,
    speed: 1,
    layers: 3,
    opacity: 0.6,
    flip: false,
    seed: 0,
  },
  argTypes: {
    colors: { control: 'object' },
    height: range(40, 400, 10),
    width: { control: 'text' },
    amplitude: range(0, 100),
    frequency: range(1, 8),
    speed: range(-4, 4, 0.1),
    layers: range(1, 8),
    opacity: range(0.1, 1, 0.05),
    flip: { control: 'boolean' },
    seed: range(0, 99),
    className: { control: 'text' },
    style: { control: 'object' },
  },
} satisfies Meta<typeof Waves>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sunset: Story = {
  args: { colors: ['#fb923c', '#f43f5e', '#7c3aed'], height: 220, amplitude: 28, frequency: 3, layers: 4, seed: 7 },
};

export const Hanging: Story = {
  args: { flip: true, colors: ['#a78bfa', '#6366f1', '#312e81'], height: 200, opacity: 0.7 },
};

export const Swell: Story = {
  args: { colors: ['#5eead4', '#14b8a6', '#115e59'], height: 260, amplitude: 44, frequency: 1, layers: 5, speed: 0.6, opacity: 0.5, seed: 21 },
};
