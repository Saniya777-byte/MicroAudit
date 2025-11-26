# Fix Document Upload and Display

## Goal Description
The user reports that selecting a document from Google Drive does not save the document, and the document card does not appear in the "My Documents" section on the HomeScreen. Additionally, the gallery upload function contains syntax errors.

## User Review Required
- Confirm that the proposed changes align with the desired behavior for document selection, upload, and display.
- Verify any UI/UX expectations for error handling and loading indicators.

## Proposed Changes
### HomeScreen.jsx
- **Fix `handleGalleryPress`**: Replace the broken implementation with a correct async function that requests media library permissions, launches the image picker, and calls `initiateUpload` with proper file details. Include proper error handling.
- **Improve `handleDrivePress`**: Add a fallback MIME type (`application/octet-stream`) when `result.mimeType` is undefined, and ensure the upload proceeds correctly.
- **Ensure imports**: Verify that `expo-document-picker` and `expo-image-picker` are correctly imported (already present). No further import changes needed.
- **Refresh document list**: The existing `uploadFile` function already calls `loadData()` after a successful upload, so no additional changes are required.

### Code Snippet
```javascript
// Updated handleGalleryPress
const handleGalleryPress = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permissions are needed to select images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      initiateUpload({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
  }
};

// Updated handleDrivePress with MIME fallback
const handleDrivePress = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.type === 'success') {
      const mime = result.mimeType || 'application/octet-stream';
      initiateUpload({
        uri: result.uri,
        name: result.name,
        mimeType: mime,
      });
    }
  } catch (err) {
    if (!DocumentPicker.isCancel(err)) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  }
};
```

## Verification Plan
- **Automated Tests**: Run the app in the simulator, trigger the "Upload" flow, select a file from Drive and from the Gallery, and verify that the document appears in the "My Documents" carousel.
- **Manual Verification**: Ask the user to open the app, press the upload button, choose a Drive file, confirm it appears, then repeat with a gallery image.

---
*Implementation will be applied in a single edit to `src/screens/HomeScreen.jsx`.*
