SELECT 
    schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'stores_reviews';
