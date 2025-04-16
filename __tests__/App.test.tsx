/**
 * @format
 */

<<<<<<< HEAD
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
=======
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
>>>>>>> 4afa2d97e8bf9adac2d6892e72b9d774a47647c5
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
<<<<<<< HEAD
test('renders MainTabs correctly when user is authenticated', async () => {
  const mockUseAuth = jest.spyOn(require('../src/context/AuthContext'), 'useAuth');
  mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });

  const mockUseTheme = jest.spyOn(require('../src/context/ThemeContext'), 'useTheme');
  mockUseTheme.mockReturnValue({ isDarkMode: false });

  const tree = ReactTestRenderer.create(
    <App />
  );

  expect(tree.toJSON()).toMatchSnapshot();
});

test('renders Login screen when user is not authenticated', async () => {
  const mockUseAuth = jest.spyOn(require('../src/context/AuthContext'), 'useAuth');
  mockUseAuth.mockReturnValue({ user: null, loading: false });

  const tree = ReactTestRenderer.create(
    <App />
  );

  expect(tree.toJSON()).toMatchSnapshot();
});

test('displays loading state when loading is true', async () => {
  const mockUseAuth = jest.spyOn(require('../src/context/AuthContext'), 'useAuth');
  mockUseAuth.mockReturnValue({ user: null, loading: true });

  const tree = ReactTestRenderer.create(
    <App />
  );

  expect(tree.toJSON()).toBeNull();
});

// Compiler options for TypeScript
const compilerOptions = {
  esModuleInterop: true,
  jsx: "react", // Ensure this is set to enable JSX
  moduleResolution: "node",
  target: "ES6",
  lib: ["ES6", "DOM"]
};

// Jest configuration
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
=======
>>>>>>> 4afa2d97e8bf9adac2d6892e72b9d774a47647c5
