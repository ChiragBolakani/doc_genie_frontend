import { ensureAuthenticated, get_access_token, isAuthenticated } from "./token_utils";

const uploadDocument = async (e) => {
  e.preventDefault();

  // Show loading overlay
  const loadingOverlay = document.getElementById('loading-overlay');
  loadingOverlay.style.display = 'flex';

  ensureAuthenticated()
  const access_token = await get_access_token()

  const formData = new FormData();
  
  const name = document.getElementById('document-name').value;
  const description = document.getElementById('document-description').value;
  const file = document.getElementById('document-file').files[0];
  
  formData.append('name', name);
  formData.append('description', description);
  formData.append('size', file.size.toString());
  formData.append('file', file);

  try {
    const response = await fetch('https://doc-genie-backend-316971717795.asia-south1.run.app/api/v1/documents/', {
      method: 'POST',
      body: formData,
      headers : {
        "Authorization" : `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success:', data);
    
    // Hide loading overlay
    loadingOverlay.style.display = 'none';
    
    // Handle success
    alert('Document uploaded successfully!');
    e.target.reset();

    // refresh user's documents
    fetchDocuments()
    
  } catch (error) {
    console.error('Error:', error);
    
    // Hide loading overlay
    loadingOverlay.style.display = 'none';
    
    // Handle error
    alert('Error uploading document. Please try again.');
  }
}

// Utility function to convert bytes to MB
const formatFileSize = (bytes) => {
  // Convert bytes to megabytes and round to 2 decimal places
  const megabytes = (bytes / (1024 * 1024)).toFixed(2);
  return `${megabytes} MB`;
};

const renderDocuments = (documents) => {
  const tableBody = document.getElementById('documents-table-body');
  
  // Clear previous content
  tableBody.innerHTML = '';

  // Create a row for each document
  documents.forEach(doc => {
    const row = document.createElement('tr');
    row.classList.add('border-b', 'border-[#eee]', 'dark:border-strokedark');

    // Document Name Cell
    const nameCell = document.createElement('td');
    nameCell.classList.add('px-4', 'py-5', 'pl-9', 'dark:border-strokedark', 'xl:pl-11');
    nameCell.innerHTML = `
      <h5 class="font-medium text-black dark:text-white">${doc.name}</h5>
    `;

    // Size Cell
    const sizeCell = document.createElement('td');
    sizeCell.classList.add('px-4', 'py-5', 'dark:border-strokedark');
    sizeCell.innerHTML = `
      <p class="text-black dark:text-white">${formatFileSize(doc.size)} bytes</p>
    `;

    // Created At Cell
    const createdAtCell = document.createElement('td');
    createdAtCell.classList.add('px-4', 'py-5', 'dark:border-strokedark');
    const formattedDate = new Date(doc.created_at).toLocaleString();
    createdAtCell.innerHTML = `
      <p class="text-black dark:text-white">${formattedDate}</p>
    `;

    // Actions Cell
    const actionsCell = document.createElement('td');
    actionsCell.classList.add('px-4', 'py-5', 'dark:border-strokedark');
    actionsCell.innerHTML = `
      <div class="flex items-center space-x-3.5">
        <button 
          id="delete-doc-${doc.id}" 
          data-doc-id="${doc.id}"
          class="delete-document-btn hover:text-primary text-meta-1" 
          title="Delete"
        >
          <svg class="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502Z" fill=""></path>
          </svg>
        </button>
      </div>
    `;

    // Append cells to row
    row.appendChild(nameCell);
    row.appendChild(sizeCell);
    row.appendChild(createdAtCell);
    row.appendChild(actionsCell);

    // Append row to table body
    tableBody.appendChild(row);
  });

  // Add event listeners to delete buttons after rendering
  addDeleteButtonListeners();
};

// Function to add event listeners to delete buttons
const addDeleteButtonListeners = () => {
  // Modal and Overlay Elements
  const deleteModal = document.getElementById('delete-modal');
  const deleteModalOverlay = document.getElementById('delete-modal-overlay');
  const confirmDeleteBtn = document.getElementById('confirm-delete');

  // Get all delete buttons
  const deleteButtons = document.querySelectorAll('.delete-document-btn');

  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Get the document ID from the data attribute
      const documentId = e.currentTarget.getAttribute('data-doc-id');

      // Show the modal
      deleteModal.classList.remove('hidden');
      deleteModal.classList.add('flex');
      deleteModalOverlay.classList.remove('hidden');

      // Store the document ID on the confirm button
      confirmDeleteBtn.setAttribute('data-doc-id', documentId);
    });
  });
};


// Corresponding action functions (you'll need to implement these)
const viewDocument = (documentId) => {
  // Implement view logic (e.g., open document in new tab)
  console.log(`Viewing document ${documentId}`);
};

const downloadDocument = (documentId) => {
  // Implement download logic
  console.log(`Downloading document ${documentId}`);
};

const fetchDocuments = async () => {
  try {
    // Ensure authentication
    ensureAuthenticated();
    
    // Get access token
    const access_token = await get_access_token();

    // Fetch documents
    const response = await fetch('https://doc-genie-backend-316971717795.asia-south1.run.app/api/v1/documents/', {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json"
      }
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const documents = await response.json();
    renderDocuments(documents);

    // Handle the documents (e.g., display them, store in state)
    console.log('Fetched Documents:', documents);

    // Optional: Render documents to the UI
    renderDocuments(documents);

    return documents;
    
  } catch (error) {
    console.error('Error fetching documents:', error);
    
    // Optional: Show error to user
    alert('Error fetching documents. Please try again.');
    
    // Optionally rethrow or handle specific error scenarios
    throw error;
  }
};

// Optional: Function to delete a specific document
const deleteDocument = async (documentId) => {
  try {
    ensureAuthenticated();
    const access_token = await get_access_token();

    const response = await fetch(`https://doc-genie-backend-316971717795.asia-south1.run.app/api/v1/documents/${documentId}/`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Close the modal
    const deleteModal = document.getElementById('delete-modal');
    const deleteModalOverlay = document.getElementById('delete-modal-overlay');
    deleteModal.classList.add('hidden');
    deleteModal.classList.remove('flex');
    deleteModalOverlay.classList.add('hidden');

    // Refresh the document list after deletion
    await fetchDocuments();
    
    alert('Document deleted successfully');
  } catch (error) {
    console.error('Error deleting document:', error);
    alert('Error deleting document. Please try again.');
  }
};

if (window.location.href.includes("/tables.html")){
  document.addEventListener('DOMContentLoaded', ()=>{

    // ensure user is authenticated
    ensureAuthenticated()

    // Close modal buttons
    document.getElementById('close-delete-modal').addEventListener('click', () => {
      const deleteModal = document.getElementById('delete-modal');
      const deleteModalOverlay = document.getElementById('delete-modal-overlay');
      deleteModal.classList.add('hidden');
      deleteModal.classList.remove('flex');
      deleteModalOverlay.classList.add('hidden');
    });

    document.getElementById('cancel-delete').addEventListener('click', () => {
      const deleteModal = document.getElementById('delete-modal');
      const deleteModalOverlay = document.getElementById('delete-modal-overlay');
      deleteModal.classList.add('hidden');
      deleteModal.classList.remove('flex');
      deleteModalOverlay.classList.add('hidden');
    });
    
    // Confirm delete button
    document.getElementById('confirm-delete').addEventListener('click', (e) => {
      const documentId = e.target.getAttribute('data-doc-id');
      if (documentId) {
        deleteDocument(documentId);
      }
    });
    
    // fetch user's documents
    fetchDocuments()
    
    // Get the button and form elements
    const addDocumentButton = document.getElementById('add-document-button');
    const documentForm = document.getElementById('document-form');

    // Add click event listener to the button
    addDocumentButton.addEventListener('click', () => {
      // Toggle the 'show' class on the form
      documentForm.classList.toggle('show');
    });

    // Add form submit event listener
    document.getElementById('document-form').addEventListener('submit', uploadDocument);
  })
}
