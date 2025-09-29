// Test script to verify database setup
const { getDatabase, dbHelpers } = require('../lib/db');

console.log('Testing database setup...');

try {
  const db = getDatabase();
  console.log('✅ Database connection successful');

  // Test creating a sample item
  const testItem = {
    id: 'test-' + Date.now(),
    url: 'https://example.com',
    title: 'Test Item',
    raw_text: 'This is a test item for verification.',
    source: 'test'
  };

  dbHelpers.createItem(testItem);
  console.log('✅ Sample item created');

  // Test retrieving items
  const items = dbHelpers.getItems({ limit: 5 });
  console.log(`✅ Retrieved ${items.length} items from database`);

  // Test user preferences
  const prefs = dbHelpers.getUserPrefs();
  console.log('✅ User preferences loaded:', prefs);

  console.log('\n🎉 Database setup is working correctly!');
} catch (error) {
  console.error('❌ Database test failed:', error);
  process.exit(1);
}
