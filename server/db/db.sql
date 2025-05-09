-- Create table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    owner VARCHAR(100) NOT NULL,
    movements FLOAT[] NOT NULL,
    interest_rate FLOAT NOT NULL,
    pin INT NOT NULL,
    movements_dates TIMESTAMP[] NOT NULL,
    currency VARCHAR(10) NOT NULL,
    locale VARCHAR(10) NOT NULL
);
-- Insert users
INSERT INTO users (
  username,
  owner,
  movements,
  interest_rate,
  pin,
  movements_dates,
  currency,
  locale
) VALUES 
(
  'js',
  'Jonas Schmedtmann',
  ARRAY[200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  1.2,
  1111,
  ARRAY[
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-03-04T17:01:17.194Z',
    '2023-03-06T23:36:17.929Z',
    '2023-03-10T10:51:36.790Z'
  ]::TIMESTAMP[],
  'EUR',
  'pt-PT'
),
(
  'jd',
  'Jessica Davis',
  ARRAY[5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  1.5,
  2222,
  ARRAY[
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-03-26T12:01:20.894Z'
  ]::TIMESTAMP[],
  'USD',
  'en-US'
);
