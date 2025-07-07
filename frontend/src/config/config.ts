/**
 * Central configuration module for API communication and HTTP request setup.
 * Manages environment-based API URL configuration and provides utilities for creating
 * standardized HTTP request configurations with proper headers and method handling.
 * Supports both data-carrying requests (POST, PUT, PATCH) and data-less requests (GET, DELETE).
 */

/** Base API URL retrieved from environment variables with fallback handling */
const apiEnv: string = process.env.REACT_APP_URL_BASE_API || '';

/** Final API URL used throughout the application with environment variable fallback */
const api: string = apiEnv ? apiEnv : '';

/**
 * Creates standardized HTTP request configuration objects for fetch API calls.
 * Automatically sets appropriate headers and body content based on HTTP method and data presence.
 * Handles JSON serialization for data-carrying requests and omits body for DELETE operations.
 * Ensures consistent Content-Type headers for API communication across the application.
 * 
 * @param method - HTTP method string (GET, POST, PUT, PATCH, DELETE)
 * @param data - Request payload data to be JSON serialized, or null for requests without body
 * @returns Configuration object compatible with fetch API containing method, headers, and optional body
 */
const requestConfig = (
  method: string,
  data: any,
) => {
  let config: any = {};

  /** Handle requests that don't require a body (DELETE operations or null data) */
  if (method === 'DELETE' || data === null) {
    config = {
      method: method,
      headers: {},
    };
  } else {
    /** Handle requests with data payload that require JSON serialization */
    config = {
      method: method,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  return config;
};

export { api, requestConfig };