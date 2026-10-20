import { fireEvent, screen, within } from '@testing-library/react';

/** Exercise the real select options without duplicating arrangement values in each flow test. */
export function selectWorkLocation(name: string | RegExp) {
  const select = screen.getByRole('combobox', { name: 'Work location' });
  const option = within(select).getByRole('option', { name }) as HTMLOptionElement;
  fireEvent.change(select, { target: { value: option.value } });
}
