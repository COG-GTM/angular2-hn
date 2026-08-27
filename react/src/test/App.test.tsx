import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Header } from '../components/Header';
import { SettingsProvider } from '../context/SettingsContext';

describe('app shell', () => {
  it('renders the Hacker News header', () => {
    render(<BrowserRouter><SettingsProvider><Header /></SettingsProvider></BrowserRouter>);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
  });
});
