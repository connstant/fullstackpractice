-- Mock links for the Link Saver app.
-- Paste into Supabase: SQL Editor -> New query -> Run.
-- Adds 15 rows to the existing `links` table; id is assigned automatically.

INSERT INTO links (url, note, tags, is_read, created_at) VALUES
  ('https://react.dev/learn', 'Official React tutorial', 'react,learning', true, now() - interval '0 days 0 hours'),
  ('https://react.dev/reference/react/useEffect', 'useEffect reference', 'react,hooks', false, now() - interval '2 days 1 hours'),
  ('https://react.dev/reference/react/useState', 'useState reference', 'react,hooks', true, now() - interval '4 days 2 hours'),
  ('https://tanstack.com/query/latest', 'For Phase 3', 'react,fetching', false, now() - interval '6 days 3 hours'),
  ('https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API', 'MDN fetch docs', 'javascript,fetching', true, now() - interval '8 days 4 hours'),
  ('https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS', 'Read before the CORS experiment', 'http,cors', false, now() - interval '10 days 5 hours'),
  ('https://developer.mozilla.org/en-US/docs/Web/HTTP/Status', 'HTTP status codes', 'http', false, now() - interval '12 days 6 hours'),
  ('https://fastapi.tiangolo.com/tutorial/', 'FastAPI tutorial', 'python,fastapi', true, now() - interval '14 days 7 hours'),
  ('https://fastapi.tiangolo.com/tutorial/cors/', NULL, 'python,fastapi,cors', false, now() - interval '16 days 8 hours'),
  ('https://docs.sqlalchemy.org/en/20/orm/quickstart.html', 'SQLAlchemy 2.0 ORM quickstart', 'python,database', false, now() - interval '18 days 9 hours'),
  ('https://supabase.com/docs/guides/database/overview', 'Supabase Postgres docs', 'database', false, now() - interval '20 days 10 hours'),
  ('https://www.typescriptlang.org/docs/handbook/2/everyday-types.html', 'TS everyday types', 'typescript', true, now() - interval '22 days 11 hours'),
  ('https://vite.dev/guide/', NULL, NULL, false, now() - interval '24 days 12 hours'),
  ('https://vercel.com/docs', 'For the deployment stretch goal', 'deployment', false, now() - interval '26 days 13 hours'),
  ('https://github.com/Kludex/mangum', 'FastAPI on Lambda', 'python,deployment', false, now() - interval '28 days 14 hours');
