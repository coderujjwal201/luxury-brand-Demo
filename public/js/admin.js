/**
 * Thistlewood - Admin Panel Frontend Controllers
 */

document.addEventListener('DOMContentLoaded', () => {
  setupSlugGenerator();
  setupVariantStockSync();
  setupOrderActions();
  setupImageUploader();
  setupCustomSizes();
});

/**
 * Automatically generate URL slug from product name in forms
 */
function setupSlugGenerator() {
  const nameInput = document.getElementById('prod-name');
  const slugInput = document.getElementById('prod-slug');
  
  if (!nameInput || !slugInput) return;

  nameInput.addEventListener('input', () => {
    // Only generate if slug is empty or matches name pattern
    const nameVal = nameInput.value;
    slugInput.value = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')     // Remove non-alphanumeric except space/hyphen
      .replace(/\s+/g, '-')             // Replace spaces with hyphens
      .replace(/-+/g, '-');             // Remove double hyphens
  });
}

/**
 * Handle Variant Stock fields compilation
 */
function setupVariantStockSync() {
  const form = document.getElementById('admin-product-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    // Compile variant JSON to hidden field before submit if needed
    // In our implementation, we'll name size inputs size_S, size_M, size_L, size_XL,
    // which the Express parser will collect, so no custom JSON conversion is strictly required on client.
  });
}

/**
 * Handle Order Status change dropdown triggers & Deletions
 */
function setupOrderActions() {
  // Order status selectors
  const statusSelectors = document.querySelectorAll('.admin-select-status');
  statusSelectors.forEach(select => {
    select.addEventListener('change', async (e) => {
      const orderId = select.getAttribute('data-order-id');
      const newStatus = select.value;

      try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
          // Flash green highlight or reload
          select.style.borderColor = '#10B981';
          setTimeout(() => select.style.borderColor = '', 1000);
        } else {
          alert(`Status Update Failed: ${result.message}`);
        }
      } catch (err) {
        alert('Server API error.');
      }
    });
  });
}

/**
 * Handle Dynamic Image URL input and native uploads
 */
function setupImageUploader() {
  const fileInput = document.getElementById('prod-image-file');
  const imageListContainer = document.getElementById('prod-images-container');
  const addUrlBtn = document.getElementById('add-image-url-btn');
  const imageUrlInput = document.getElementById('prod-image-url');

  if (!imageListContainer) return;

  // Add Image via direct URL entry
  if (addUrlBtn && imageUrlInput) {
    addUrlBtn.addEventListener('click', () => {
      const url = imageUrlInput.value.trim();
      if (!url) return;
      
      addImagePreview(url);
      imageUrlInput.value = '';
    });
  }

  // Add Image via Local Native File Upload
  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      if (fileInput.files.length === 0) return;
      
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (response.ok && result.success) {
          addImagePreview(result.url);
        } else {
          alert(`Upload Failed: ${result.message}`);
        }
      } catch (err) {
        alert('File upload API error.');
      }
      
      // Reset input
      fileInput.value = '';
    });
  }

  // Handle deletions of image previews
  imageListContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-preview-btn') || e.target.parentElement.classList.contains('remove-preview-btn')) {
      const btn = e.target.classList.contains('remove-preview-btn') ? e.target : e.target.parentElement;
      const thumb = btn.closest('.preview-thumb');
      thumb.remove();
      syncImagesHiddenInput();
    }
  });
}

function addImagePreview(url) {
  const container = document.getElementById('prod-images-container');
  
  const div = document.createElement('div');
  div.classList.add('preview-thumb');
  div.innerHTML = `
    <img src="${url}" alt="Preview">
    <button type="button" class="remove-preview-btn" style="position: absolute; top: 5px; right: 5px; background: rgba(239, 68, 68, 0.9); border: none; color: #FFF; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px;">&times;</button>
    <input type="hidden" name="product_images[]" value="${url}">
  `;
  
  container.appendChild(div);
}

function syncImagesHiddenInput() {
  // Implicitly handled because the forms gather all input[name="product_images[]"] values dynamically
}

/**
 * Handle confirmation delete triggers
 */
async function deleteProduct(productId, productName) {
  const confirmDelete = confirm(`Are you sure you want to permanently delete the product "${productName}"? This action cannot be undone.`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    if (response.ok && result.success) {
      window.location.reload();
    } else {
      alert(`Deletion Failed: ${result.message}`);
    }
  } catch (err) {
    alert('Server delete API error.');
  }
}

/**
 * Handle custom dynamic size allocations row addition & deletion
 */
function setupCustomSizes() {
  const container = document.getElementById('sizes-container');
  const addBtn = document.getElementById('add-size-btn');
  if (!container || !addBtn) return;

  addBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.classList.add('size-row');
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.alignItems = 'center';
    row.innerHTML = `
      <input type="text" name="sizes[]" placeholder="e.g. S, M, XL, 38" required style="flex: 2; padding: 8px; border: 1px solid var(--border-color); background: transparent; color: var(--text-color);">
      <input type="number" name="stocks[]" value="10" min="0" placeholder="Stock" required style="flex: 1; padding: 8px; border: 1px solid var(--border-color); background: transparent; color: var(--text-color);">
      <button type="button" class="remove-size-btn admin-btn-danger" style="padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; border: none; cursor: pointer;">&times;</button>
    `;
    container.appendChild(row);
  });

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-size-btn') || e.target.parentElement.classList.contains('remove-size-btn')) {
      const btn = e.target.classList.contains('remove-size-btn') ? e.target : e.target.parentElement;
      const row = btn.closest('.size-row');
      if (row) {
        row.remove();
      }
    }
  });
}
