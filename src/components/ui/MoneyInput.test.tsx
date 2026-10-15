import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MoneyInput from './MoneyInput';

function Form() {
  const [value,setValue] = useState(0);
  return <><MoneyInput aria-label="Price" min={50} max={50000} value={value} onChange={event => setValue(Number(event.target.value))}/><output>{value}</output><button onClick={() => setValue(1500)}>Edit another listing</button></>;
}
describe('money editing without a stuck zero', () => {
  it('allows clearing, entering a replacement price, and removing leading zeroes without changing numeric form state', () => {
    render(<Form/>);
    const input = screen.getByRole('spinbutton', { name:'Price' });
    expect(input).toHaveValue(null);
    fireEvent.change(input, { target:{value:'0500'} });
    expect(input).toHaveValue(500);
    expect(input).toHaveAttribute('value','500');
    expect(screen.getByRole('status')).toHaveTextContent('500');
    fireEvent.change(input, { target:{value:''} });
    expect(input).toHaveValue(null);
    expect(screen.getByRole('status')).toHaveTextContent('0');
    fireEvent.change(input, { target:{value:'750'} });
    expect(input).toHaveValue(750);
    fireEvent.click(screen.getByRole('button'));
    expect(input).toHaveValue(1500);
    expect(input).toHaveAttribute('min','50');
    expect(input).toHaveAttribute('max','50000');
  });
});
