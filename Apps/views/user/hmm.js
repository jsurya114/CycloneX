
    // Form submission with validation
    document.getElementById('addProductForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(this);

      
                      // Clear previous errors
                      document.getElementById('productNameError').textContent = '';
                document.getElementById('descriptionError').textContent = '';
                document.getElementById('priceError').textContent = '';
                document.getElementById('stockError').textContent = '';
                document.getElementById('offerError').textContent = '';

                const result = await Swal.fire({
                    title: 'Confirm Update?',
                    text: "Do you want to save these changes?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, update it!',
                    cancelButtonText: 'Cancel'
                });
      
      if (result.isConfirmed) {
        const formData = new FormData(this);
        try {
          const response = await fetch('/admin/addproduct', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            // Display validation errors
            if (data.errors) {
              for (const field in data.errors) {
                const errorElement = document.getElementById(`error-${field}`);
                if (errorElement) {
                  errorElement.textContent = data.errors[field];
                }
              }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Failed to add product',
                text: data.message || 'An error occurred'
              });
            }
            return;
          }
          
          // Success message and redirect
          Swal.fire({
            icon: 'success',
            title: 'Product added successfully!'
          }).then(() => {
            window.location.href = '/admin/product-list2';
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to add product',
            text: error.message
          });
        }
      }
    });
