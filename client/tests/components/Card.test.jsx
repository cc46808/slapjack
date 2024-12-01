import { render, fireEvent } from '@testing-library/react';
import { Card } from '../../src/components/game/Card';

describe('Card Component', () => {
  const mockCard = { rank: 'A', suit: 'hearts' };

  test('renders card correctly', () => {
    const { getByText } = render(<Card card={mockCard} />);
    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('♥')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <Card card={mockCard} onClick={handleClick} />
    );
    fireEvent.click(container.firstChild);
    expect(handleClick).toHaveBeenCalled();
  });
});