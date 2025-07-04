#!/usr/bin/env node

/**
 * Test script to verify media integration is working
 */

async function testMediaAPI() {
  console.log('🧪 Testing Media API Integration');
  console.log('=' * 50);
  
  try {
    // Test 1: Check frontend API route
    console.log('\n📡 Testing Frontend API Route...');
    const frontendResponse = await fetch('http://localhost:3000/api/media');
    
    if (frontendResponse.ok) {
      const frontendData = await frontendResponse.json();
      console.log(`✅ Frontend API: ${frontendData.results?.length || 0} media items found`);
      
      if (frontendData.results && frontendData.results.length > 0) {
        const firstItem = frontendData.results[0];
        console.log(`📄 Sample item: ${firstItem.title}`);
        console.log(`🔗 Link field: ${firstItem.link || 'null'}`);
        console.log(`🔄 Transformed link: ${firstItem.transformed_link || 'null'}`);
        
        // Test detail endpoint
        if (firstItem.slug) {
          console.log(`\n📖 Testing Detail Endpoint...`);
          const detailResponse = await fetch(`http://localhost:3000/api/media/${firstItem.slug}`);
          
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            console.log(`✅ Detail API: ${detailData.title}`);
            console.log(`🔗 Detail link: ${detailData.link || 'null'}`);
            console.log(`🔄 Detail transformed: ${detailData.transformed_link || 'null'}`);
          } else {
            console.log(`❌ Detail API failed: ${detailResponse.status}`);
          }
        }
      }
    } else {
      console.log(`❌ Frontend API failed: ${frontendResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
  
  console.log('\n' + '=' * 50);
  console.log('🏁 Test completed!');
  console.log('\n💡 Next steps:');
  console.log('1. Check http://localhost:3000/media to see the updated UI');
  console.log('2. Click on a media item to see the detail page');
  console.log('3. Look for Spotify embed players on podcast pages');
  console.log('4. Verify platform indicators are showing correctly');
}

// Run the test
testMediaAPI().catch(console.error);