<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CycloneX Shop</title>
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Three.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

    <!-- Tailwind Configuration -->
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#3B82F6',
                        secondary: '#10B981',
                        accent: '#60A5FA',
                        dark: '#1E293B',
                        light: '#F8FAFC',
                        card: {
                            blue: '#DBEAFE',
                            purple: '#EDE9FE',
                            green: '#DCFCE7',
                            pink: '#FCE7F3',
                            orange: '#FFEDD5'
                        },
                        'card-dark': {
                            blue: '#1E3A8A',
                            purple: '#5B21B6',
                            green: '#166534',
                            pink: '#831843',
                            orange: '#7C2D12'
                        }
                    },
                    fontFamily: {
                        'sans': ['Inter', 'sans-serif'],
                        'heading': ['Plus Jakarta Sans', 'sans-serif']
                    },
                    boxShadow: {
                        'custom': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
                        'hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }
                }
            }
        }
    </script>

    <!-- Custom Styles -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F8FAFC;
            transition: background-color 0.3s ease;
        }

        .dark body {
            background-color: #0F172A;
            color: #F8FAFC;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Custom scrollbar for Webkit browsers */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: #F1F5F9;
            border-radius: 8px;
        }
        
        .dark ::-webkit-scrollbar-track {
            background: #1E293B;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 8px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
            background: #475569;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #94A3B8;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
            background: #64748B;
        }

        /* Price range slider styling */
        input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            background: #E2E8F0;
            border-radius: 10px;
            outline: none;
        }
        
        .dark input[type="range"] {
            background: #334155;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #3B82F6;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .dark input[type="range"]::-webkit-slider-thumb {
            border-color: #1E293B;
        }

        input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #3B82F6;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .dark input[type="range"]::-moz-range-thumb {
            border-color: #1E293B;
        }

        /* Checkbox styling */
        .custom-checkbox {
            display: flex;
            align-items: center;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 0.375rem;
        }

        .custom-checkbox:hover {
            background-color: #F1F5F9;
        }
        
        .dark .custom-checkbox:hover {
            background-color: #334155;
        }

        .custom-checkbox input[type="checkbox"] {
            width: 1rem;
            height: 1rem;
            margin-right: 0.5rem;
            border-radius: 0.25rem;
            border: 1.5px solid #CBD5E1;
            transition: all 0.2s;
            accent-color: #3B82F6;
        }
        
        .dark .custom-checkbox input[type="checkbox"] {
            border-color: #475569;
        }

        .custom-checkbox input[type="checkbox"]:checked {
            background-color: #3B82F6;
            border-color: #3B82F6;
        }

        /* Filter dropdown animation */
        .filter-dropdown {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
        }

        .filter-dropdown.open {
            max-height: 2000px;
            transition: max-height 0.5s cubic-bezier(0.9, 0, 0.3, 0.9);
        }

        /* Quick view modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 50;
            overflow: auto;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .modal.show {
            display: flex;
            opacity: 1;
        }

        .modal-content {
            background-color: white;
            margin: auto;
            border-radius: 1rem;
            max-width: 900px;
            width: 90%;
            transform: translateY(-50px);
            transition: transform 0.3s ease;
            overflow: hidden;
        }
        
        .dark .modal-content {
            background-color: #1E293B;
            color: #F8FAFC;
        }

        .modal.show .modal-content {
            transform: translateY(0);
        }

        /* Button hover effect */
        .btn-hover-effect {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .btn-hover-effect:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: -100%;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
            transition: all 0.6s ease;
        }

        .btn-hover-effect:hover:after {
            left: 100%;
        }

        /* Filter toggle animation */
        .filter-toggle {
            transition: transform 0.3s ease;
        }

        .filter-toggle.open {
            transform: rotate(180deg);
        }
        
        /* Loading indicator for Three.js */
        .loading-spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 30px;
            height: 30px;
            border: 2px solid rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            border-top-color: #3B82F6;
            animation: spin 1s ease-in-out infinite;
            z-index: 5;
        }
        
        @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* REDESIGNED PRODUCT CARDS - KREO STYLE */
        
        /* View toggle buttons */
        .view-toggle-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .view-toggle-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .view-toggle-btn.active {
            background-color: #3B82F6;
            color: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .view-toggle-btn:not(.active) {
            background-color: #F1F5F9;
            color: #64748B;
        }
        
        .dark .view-toggle-btn:not(.active) {
            background-color: #334155;
            color: #94A3B8;
        }
        
        .view-toggle-btn:hover:not(.active) {
            background-color: #E2E8F0;
            transform: translateY(-2px);
        }
        
        .dark .view-toggle-btn:hover:not(.active) {
            background-color: #475569;
        }
        
        .view-toggle-btn i {
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        /* Grid View - Kreo Style */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        
        .product-card {
            position: relative;
            border-radius: 16px;
            overflow: hidden;
            background: white;
            transition: all 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .dark .product-card {
            background: #1E293B;
        }
        
        .product-card:hover {
            transform: translateY(-8px);
        }
        
        .product-card .card-image-container {
            position: relative;
            height: 280px;
            overflow: hidden;
            background: #DBEAFE; /* Default light blue */
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .dark .product-card .card-image-container {
            background: #1E3A8A; /* Dark blue */
        }
        
        /* Card background color variations */
        .product-card.color-blue .card-image-container { background: #DBEAFE; }
        .product-card.color-purple .card-image-container { background: #EDE9FE; }
        .product-card.color-green .card-image-container { background: #DCFCE7; }
        .product-card.color-orange .card-image-container { background: #FFEDD5; }
        
        .dark .product-card.color-blue .card-image-container { background: #1E3A8A; }
        .dark .product-card.color-purple .card-image-container { background: #5B21B6; }
        .dark .product-card.color-green .card-image-container { background: #166534; }
        .dark .product-card.color-orange .card-image-container { background: #7C2D12; }
        
        /* Product image slider styles */
        .product-images-slider {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            transition: transform 0.5s ease;
        }
        
        .product-card .card-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 1rem;
            transition: transform 0.3s ease;
            flex-shrink: 0;
        }
        
        .product-card:hover .card-image {
            transform: scale(1.05);
        }
        
        /* Enhanced image slider animation on hover - Kreo Style */
        .product-card:hover .product-images-slider {
            animation: slideImages 5s ease-in-out infinite;
        }
        
        @keyframes slideImages {
            0% { transform: translateX(0); }
            20% { transform: translateX(0); }
            25% { transform: translateX(-100%); }
            45% { transform: translateX(-100%); }
            50% { transform: translateX(-200%); }
            70% { transform: translateX(-200%); }
            75% { transform: translateX(-100%); }
            95% { transform: translateX(-100%); }
            100% { transform: translateX(0); }
        }
        
        /* Pause animation when user interacts with dots */
        .product-card .image-nav:hover + .product-images-slider,
        .product-card .image-nav:focus + .product-images-slider,
        .product-card .image-nav:active + .product-images-slider {
            animation-play-state: paused;
        }
        
        /* Image navigation controls */
        .image-nav {
            position: absolute;
            bottom: 10px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            gap: 6px;
            z-index: 5;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .product-card:hover .image-nav {
            opacity: 1;
        }
        
        .image-nav-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .image-nav-dot.active {
            background-color: white;
            transform: scale(1.2);
        }
        
        .dark .image-nav-dot {
            background-color: rgba(30, 41, 59, 0.5);
        }
        
        .dark .image-nav-dot.active {
            background-color: #1E293B;
        }
        
        .product-card .card-content {
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            position: relative;
        }
        
        /* Save badge - Kreo style */
        .product-card .save-badge {
            position: absolute;
            top: 1rem;
            left: 1rem;
            z-index: 10;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.85);
            color: #3B82F6;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .dark .product-card .save-badge {
            background: rgba(30, 41, 59, 0.85);
            color: #60A5FA;
        }
        
        .product-card .out-of-stock-badge {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            z-index: 10;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.9);
            color: #EF4444;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .dark .product-card .out-of-stock-badge {
            background: rgba(30, 41, 59, 0.9);
        }
        
        /* Rating badge - Kreo style */
        .product-card .rating-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            z-index: 10;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.85);
            color: #F59E0B;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .dark .product-card .rating-badge {
            background: rgba(30, 41, 59, 0.85);
        }
        
        .product-card .wishlist-btn {
            position: absolute;
            top: 4rem;
            right: 1rem;
            z-index: 10;
            background: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .dark .product-card .wishlist-btn {
            background: #334155;
        }
        
        .product-card .wishlist-btn:hover {
            transform: scale(1.1);
        }
        
        /* Enhanced wishlist button styles */
        .product-card .wishlist-btn.active {
            background: #FEE2E2;
            box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
        }
        
        .dark .product-card .wishlist-btn.active {
            background: rgba(239, 68, 68, 0.2);
        }
        
        .product-card .wishlist-btn.active .wishlist-icon {
            color: #EF4444;
        }
        
        /* Wishlist button animation */
        @keyframes heartBeat {
            0% { transform: scale(1); }
            14% { transform: scale(1.3); }
            28% { transform: scale(1); }
            42% { transform: scale(1.3); }
            70% { transform: scale(1); }
        }
        
        .wishlist-animation {
            animation: heartBeat 1s;
        }
        
        /* Redesigned Quick View Button - Kreo Style */
        .product-card .quick-view-btn {
            position: absolute;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            background: rgba(59, 130, 246, 0.9);
            color: white;
            text-align: center;
            padding: 0.4rem 0.8rem;
            opacity: 0;
            transition: all 0.3s ease;
            font-weight: 500;
            z-index: 5;
            font-size: 0.75rem;
            border-radius: 30px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(4px);
            width: auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.3rem;
            min-width: 0;
            white-space: nowrap;
        }

        .dark .product-card .quick-view-btn {
            background: rgba(59, 130, 246, 0.8);
        }

        .product-card:hover .quick-view-btn {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        .product-card .quick-view-btn:hover {
            background: rgba(37, 99, 235, 0.9);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }
        
        .product-card .brand-name {
            font-size: 0.75rem;
            font-weight: 500;
            color: #64748B;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .dark .product-card .brand-name {
            color: #94A3B8;
        }
        
        .product-card .product-title {
            font-weight: 600;
            font-size: 1rem;
            line-height: 1.4;
            color: #0F172A;
            margin-bottom: 0.75rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 2.8rem;
        }
        
        .dark .product-card .product-title {
            color: #F8FAFC;
        }
        
        .product-card .price-container {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .product-card .price-display {
            display: flex;
            flex-direction: column;
        }
        
        .product-card .original-price {
            text-decoration: line-through;
            color: #94A3B8;
            font-size: 0.8rem;
        }
        
        .dark .product-card .original-price {
            color: #64748B;
        }
        
        .product-card .current-price {
            font-weight: 700;
            font-size: 1.1rem;
            color: #3B82F6;
        }
        
        /* Redesigned add to cart button */
        .product-card .add-to-cart-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #3B82F6;
            color: white;
            border-radius: 8px;
            width: 36px;
            height: 36px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }
        
        .product-card .add-to-cart-btn:hover:not(:disabled) {
            background: #2563EB;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
        }
        
        .product-card .add-to-cart-btn:disabled {
            background: #CBD5E1;
            cursor: not-allowed;
            color: #94A3B8;
        }
        
        .dark .product-card .add-to-cart-btn:disabled {
            background: #475569;
            color: #94A3B8;
        }
        
        .product-card .add-to-cart-btn i {
            font-size: 0.9rem;
        }
        
        /* List View - Kreo Style */
        .products-list {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }
        
        .products-list .product-card {
            flex-direction: row;
            height: auto;
            max-height: none;
        }
        
        .products-list .product-card .card-image-container {
            width: 200px;
            min-width: 200px;
            height: 200px;
            border-radius: 16px 0 0 16px;
        }
        
        .products-list .product-card .card-content {
            flex: 1;
            border-radius: 0 16px 16px 0;
            display: flex;
            flex-direction: column;
        }
        
        .products-list .product-card .product-title {
            height: auto;
            -webkit-line-clamp: 1;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .products-list .product-card .product-description {
            color: #64748B;
            font-size: 0.875rem;
            margin-bottom: 1rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .dark .products-list .product-card .product-description {
            color: #94A3B8;
        }
        
        .products-list .product-card .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            padding-top: 1rem;
            border-top: 1px solid #E2E8F0;
        }
        
        .dark .products-list .product-card .card-footer {
            border-top-color: #334155;
        }
        
        .products-list .product-card .add-to-cart-btn {
            width: auto;
            padding: 0 1rem;
            gap: 0.5rem;
            height: 38px;
        }
        
        .products-list .product-card .add-to-cart-btn span {
            font-weight: 500;
            font-size: 0.875rem;
        }
        
        /* Responsive adjustments for list view */
        @media (max-width: 768px) {
            .products-list .product-card {
                flex-direction: column;
            }
            
            .products-list .product-card .card-image-container {
                width: 100%;
                border-radius: 16px 16px 0 0;
            }
            
            .products-list .product-card .card-content {
                border-radius: 0 0 16px 16px;
            }
        }
        
        /* Empty state styling */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .dark .empty-state {
            background: #1E293B;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .empty-state-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto 1.5rem;
            color: #94A3B8;
        }
        
        .dark .empty-state-icon {
            color: #64748B;
        }
        
        .empty-state-text {
            font-size: 1.25rem;
            color: #475569;
            margin-bottom: 1.5rem;
        }
        
        .dark .empty-state-text {
            color: #E2E8F0;
        }
        
        .empty-state-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #3B82F6;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .empty-state-button:hover {
            background: #2563EB;
        }
        
        /* Modal redesign - Kreo Style */
        .enhanced-modal {
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .modal-product-container {
            height: 400px;
            width: 100%;
            background: #DBEAFE;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .dark .modal-product-container {
            background: #1E3A8A;
        }
        
        .modal-product-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            padding: 2rem;
            transition: transform 0.3s ease;
        }
        
        .modal-product-image:hover {
            transform: scale(1.05);
        }
        
        .modal-close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: white;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 10;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .dark .modal-close-btn {
            background: #334155;
            color: #E2E8F0;
        }
        
        .modal-close-btn:hover {
            transform: scale(1.1);
        }
        
        .modal-product-details {
            padding: 2rem;
        }
        
        .modal-product-brand {
            font-size: 0.875rem;
            font-weight: 500;
            color: #64748B;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .dark .modal-product-brand {
            color: #94A3B8;
        }
        
        .modal-product-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        
        .dark .modal-product-title {
            color: #F8FAFC;
        }
        
        .modal-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .modal-rating .stars {
            display: flex;
            color: #F59E0B;
        }
        
        .modal-rating .count {
            color: #64748B;
            font-size: 0.875rem;
        }
        
        .dark .modal-rating .count {
            color: #94A3B8;
        }
        
        .modal-price-container {
            display: flex;
            align-items: baseline;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        
        .modal-original-price {
            text-decoration: line-through;
            color: #94A3B8;
            font-size: 1rem;
        }
        
        .dark .modal-original-price {
            color: #64748B;
        }
        
        .modal-current-price {
            font-weight: 700;
            font-size: 1.75rem;
            color: #3B82F6;
        }
        
        .modal-discount-badge {
            background-color: rgba(239, 68, 68, 0.1);
            color: #EF4444;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
        }
        
        .dark .modal-discount-badge {
            background-color: rgba(239, 68, 68, 0.15);
        }
        
        .modal-description {
            color: #475569;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        
        .dark .modal-description {
            color: #CBD5E1;
        }
        
        .modal-options {
            margin-bottom: 2rem;
        }
        
        .modal-option-title {
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 0.75rem;
            color: #0F172A;
        }
        
        .dark .modal-option-title {
            color: #F8FAFC;
        }
        
        .modal-option-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
        }
        
        .modal-option-btn {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: #475569;
            background: white;
            transition: all 0.2s ease;
        }
        
        .dark .modal-option-btn {
            border-color: #334155;
            background: #1E293B;
            color: #CBD5E1;
        }
        
        .modal-option-btn.active {
            border-color: #3B82F6;
            background: rgba(59, 130, 246, 0.1);
            color: #3B82F6;
        }
        
        .dark .modal-option-btn.active {
            background: rgba(59, 130, 246, 0.2);
        }
        
        .modal-option-btn:hover:not(.active) {
            background: #F8FAFC;
        }
        
        .dark .modal-option-btn:hover:not(.active) {
            background: #334155;
        }
        
        .modal-quantity {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .modal-quantity-control {
            display: flex;
            align-items: center;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .dark .modal-quantity-control {
            border-color: #334155;
        }
        
        .modal-quantity-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            color: #475569;
            transition: all 0.2s ease;
        }
        
        .dark .modal-quantity-btn {
            background: #1E293B;
            color: #CBD5E1;
        }
        
        .modal-quantity-btn:hover {
            background: #F8FAFC;
        }
        
        .dark .modal-quantity-btn:hover {
            background: #334155;
        }
        
        .modal-quantity-input {
            width: 40px;
            height: 36px;
            border: none;
            text-align: center;
            font-weight: 500;
            color: #0F172A;
            background: white;
        }
        
        .dark .modal-quantity-input {
            background: #1E293B;
            color: #F8FAFC;
        }
        
        .modal-action-buttons {
            display: flex;
            gap: 1rem;
        }
        
        .modal-add-to-cart-btn {
            flex: 1;
            background: #3B82F6;
            color: white;
            padding: 0.875rem;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .modal-add-to-cart-btn:hover:not(:disabled) {
            background: #2563EB;
        }
        
        .modal-add-to-cart-btn:disabled {
            background: #CBD5E1;
            cursor: not-allowed;
            color: #94A3B8;
        }
        
        .dark .modal-add-to-cart-btn:disabled {
            background: #475569;
            color: #94A3B8;
        }
        
        .modal-view-details-btn {
            flex: 1;
            background: white;
            color: #0F172A;
            border: 1px solid #E2E8F0;
            padding: 0.875rem;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .dark .modal-view-details-btn {
            background: #1E293B;
            color: #F8FAFC;
            border-color: #334155;
        }
        
        .modal-view-details-btn:hover {
            background: #F8FAFC;
        }
        
        .dark .modal-view-details-btn:hover {
            background: #334155;
        }
        
        /* Toast notification */
        #toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background-color: #0F172A;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 50;
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .dark #toast {
            background-color: #334155;
        }
        
        #toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        #toast.error {
            background-color: #EF4444;
        }
        
        /* Cart confirmation message */
        #cartConfirmation {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background-color: white;
            color: #0F172A;
            padding: 1.25rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            z-index: 51;
            opacity: 0;
            transition: transform 0.4s ease, opacity 0.4s ease;
            width: 320px;
            border: 1px solid #E2E8F0;
        }
        
        .dark #cartConfirmation {
            background-color: #1E293B;
            color: #F8FAFC;
            border-color: #334155;
        }
        
        #cartConfirmation.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        /* Animation for the cart icon */
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-10px);}
            60% {transform: translateY(-5px);}
        }
        
        .cart-bounce {
            animation: bounce 1s ease;
        }
        
        /* Dark mode toggle button */
        .dark-mode-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background: #3B82F6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            z-index: 40;
            transition: all 0.3s ease;
        }
        
        .dark-mode-toggle:hover {
            transform: scale(1.1);
        }
        
        .dark-mode-toggle i {
            font-size: 1.25rem;
            transition: transform 0.5s ease;
        }
        
        .dark-mode-toggle:hover i {
            transform: rotate(30deg);
        }
        
        /* Pagination styling */
        .pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .pagination-item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .pagination-item.active {
            background: #3B82F6;
            color: white;
        }
        
        .pagination-item:not(.active) {
            background: white;
            color: #475569;
            border: 1px solid #E2E8F0;
        }
        
        .dark .pagination-item:not(.active) {
            background: #1E293B;
            color: #CBD5E1;
            border-color: #334155;
        }
        
        .pagination-item:not(.active):hover {
            background: #F8FAFC;
        }
        
        .dark .pagination-item:not(.active):hover {
            background: #334155;
        }
    </style>
</head>
<body class="text-gray-800 dark:text-gray-100">
    <%- include('partials/header') %>

<!-- Page Title -->
<div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2 relative">
            Discover Our Collection
            <span class="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
        </h1>
        <div class="flex items-center text-gray-500 dark:text-gray-400 mt-4">
            <%- include('partials/breadcrumbs') %>
        </div>
    </div>
</div>

<!-- Main Content -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Filter & Sort Toggle Button -->
    <div class="mb-6 flex justify-center">
        <button id="filterToggleBtn" class="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span class="font-medium">Filters & Sorting</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 filter-toggle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    </div>

    <!-- View Toggle Buttons -->
    <div class="flex justify-end mb-6">
        <div class="view-toggle-container">
            <span class="text-gray-700 dark:text-gray-300 font-medium">View:</span>
            <button id="gridViewBtn" class="view-toggle-btn active" aria-label="Grid view">
                <i class="fas fa-th"></i>
            </button>
            <button id="listViewBtn" class="view-toggle-btn" aria-label="List view">
                <i class="fas fa-list"></i>
            </button>
        </div>
    </div>

    <!-- Filter & Sort Section (Hidden by Default) -->
    <div id="filterSection" class="filter-dropdown mb-8">
        <div class="filter-section bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <!-- Categories -->
                <div>
                    <h3 class="text-gray-900 dark:text-gray-100 font-medium mb-3 font-heading">Categories</h3>
                    <div id="categoryFiltersContainer">
                        <div class="space-y-1">
                            <label class="custom-checkbox">
                                <input type="checkbox" id="allCategories" class="accent-primary" name="categoryFilter" checked>
                                <span class="ml-2 dark:text-gray-300">All Categories</span>
                            </label>
                            <% categories.forEach(cat => { %>
                            <label class="custom-checkbox">
                                <input type="checkbox" class="accent-primary" name="categoryFilter" value="<%= cat.name %>" disabled>
                                <span class="ml-2 dark:text-gray-300"><%= cat.name %></span>
                            </label>
                            <% }) %>
                        </div>
                    </div>
                </div>
                
                <!-- Price Range -->
                <div>
                    <h3 class="text-gray-900 dark:text-gray-100 font-medium mb-3 font-heading">Price Range</h3>
                    <input 
                    type="range" 
                    min="0" 
                    max="34999" 
                    value="17500" 
                    class="w-full"
                    id="priceRange"
                    >
                    <div class="flex justify-between mt-2">
                        <span class="text-sm text-gray-500 dark:text-gray-400">₹0</span>
                        <span class="text-sm font-medium text-primary" id="priceValue">₹17,500</span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">₹34,999</span>
                    </div>
                </div>
                
                <!-- Brands -->
                <div>
                    <h3 class="text-gray-900 dark:text-gray-100 font-medium mb-3 font-heading">Brands</h3>
                    <div id="brandFiltersContainer" class="space-y-1">
                        <label class="custom-checkbox">
                            <input type="checkbox" id="allBrands" class="accent-primary" name="brandsFilter" checked>
                            <span class="ml-2 dark:text-gray-300">All Brands</span>
                        </label>
                        <% brands.forEach(brand => { %>
                        <label class="custom-checkbox">
                            <input type="checkbox" class="accent-primary" name="brandsFilter" value="<%= brand.name %>" disabled>
                            <span class="ml-2 dark:text-gray-300"><%= brand.name %></span>
                        </label>
                        <% }); %>
                    </div>
                </div>
                
                <!-- Sort and Actions -->
                <div>
                    <h3 class="text-gray-900 dark:text-gray-100 font-medium mb-3 font-heading">Sort By</h3>
                    <select id="sortBy" class="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <option value="">Featured</option>
                        <option value="priceLowHigh">Price: Low to High</option>
                        <option value="priceHighLow">Price: High to Low</option>
                        <option value="newest">Newest</option>
                        <option value="aToZ">A to Z</option>
                        <option value="zToA">Z to A</option>
                    </select>

                    <!-- Apply and Clear Buttons -->
                    <div class="mt-5 space-y-3">
                        <button class="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 btn-hover-effect">
                            Apply Filters
                        </button>
                        <button id="clearBtn" class="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Products Container (Grid View by Default) -->
    <div id="productsContainer" class="products-grid">
        <!-- Product Cards -->
        <% if (product.length > 0) { %>
            <% 
            // Define background color classes for product cards
            const bgColors = ['color-blue', 'color-purple', 'color-green', 'color-orange'];
            
            product.forEach((pro, index) => { 
                // Assign a background color class based on index
                const colorClass = bgColors[index % bgColors.length];
                
                // Calculate discount percentage
                const discountPercent = pro.maxOffer > 0 ? pro.maxOffer : Math.round((pro.price - pro.salePrice) / pro.price * 100);
            %>
            <div class="product-card <%= colorClass %>" data-product-id="<%= pro._id %>">
                <!-- Product Image Container -->
                <div class="card-image-container">
                    <!-- Product Images Slider -->
                    <div class="product-images-slider" data-current-image="0">
                        <!-- Main Product Image -->
                        <img 
                            src="/<%= pro.mainImage %>" 
                            alt="<%= pro.productName %>" 
                            class="card-image"
                            crossorigin="anonymous"
                        >
                        
                        <!-- Additional Product Images (if available) -->
                        <% if (pro.images && pro.images.length > 0) { %>
                            <% pro.images.forEach(img => { %>
                                <img 
                                    src="/<%= img %>" 
                                    alt="<%= pro.productName %>" 
                                    class="card-image"
                                    crossorigin="anonymous"
                                >
                            <% }); %>
                        <% } %>
                    </div>
                    
                    <!-- Image Navigation Dots -->
                    <% if (pro.images && pro.images.length > 0) { %>
                        <div class="image-nav">
                            <span class="image-nav-dot active" data-index="0"></span>
                            <% pro.images.forEach((img, imgIndex) => { %>
                                <span class="image-nav-dot" data-index="<%= imgIndex + 1 %>"></span>
                            <% }); %>
                        </div>
                    <% } %>
                    
                    <!-- Save Badge (Kreo Style) -->
                    <% if (pro.maxOffer > 0) { %>
                    <div class="save-badge">
                        Save <%= pro.maxOffer %>%
                    </div>
                    <% } %>
                    
                    <!-- Rating Badge (Kreo Style) -->
                    <div class="rating-badge">
                        <i class="fas fa-star text-yellow-400"></i> 4.5
                    </div>
                    
                    <!-- Out of Stock Badge -->
                    <% if(pro.stock === 0) { %>
                    <div class="out-of-stock-badge">
                        Out of Stock
                    </div>
                    <% } %>
                    
                    <!-- Wishlist Button -->
                    <button 
                        onclick="addToWishlist('<%= pro._id %>', this)" 
                        class="wishlist-btn"
                        aria-label="Add to wishlist"
                        data-product-id="<%= pro._id %>"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            stroke-width="2" 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            class="wishlist-icon text-gray-500 transition-colors duration-200"
                            data-product-id="<%= pro._id %>"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    
                    <!-- Quick View Button -->
                    <button 
                        onclick="openQuickView('<%= pro._id %>', '<%= pro.productName %>', '/<%= pro.mainImage %>', '<%= pro.description %>', '<%= pro.price %>','<%= pro.brands ? pro.brands.name : 'No Brand' %>', '<%= pro.maxOffer %>', '<%= pro.salePrice %>', '<%= pro.stock %>')" 
                        class="quick-view-btn"
                    >
                        <i class="fas fa-eye"></i> Quick
                    </button>
                </div>
                
                <div class="card-content">
                    <!-- Brand Name -->
                    <% if (pro.brands) { %>
                    <div class="brand-name">
                        <%= pro.brands.name %>
                    </div>
                    <% } %>
                    
                    <!-- Product Title -->
                    <a href="/productdetails/<%= pro._id%>" class="block"> 
                        <h3 class="product-title"><%= pro.productName %></h3>
                    </a>
                    
                    <!-- Product description (hidden in grid view) -->
                    <p class="product-description hidden">
                        High-performance cycle with advanced features for both casual riders and enthusiasts.
                    </p>
                    
                    <!-- Price and Add to Cart -->
                    <div class="price-container">
                        <div class="price-display">
                            <% if (pro.maxOffer > 0) { %>
                                <span class="original-price">₹<%= pro.price %></span>
                                <span class="current-price">₹<%= Math.round(pro.salePrice) %></span>
                            <% } else { %>
                                <span class="current-price">₹<%= pro.price %></span>
                            <% } %>
                        </div>
                        
                        <!-- Add to Cart Button (disabled for out of stock products) -->
                        <button 
                            onclick="addToCart('<%= pro._id %>')" 
                            class="add-to-cart-btn"
                            <%= pro.stock === 0 ? 'disabled' : '' %>
                            aria-label="<%= pro.stock === 0 ? 'Out of stock' : 'Add to cart' %>"
                        >
                            <i class="fas <%= pro.stock === 0 ? 'fa-ban' : 'fa-shopping-cart' %>"></i>
                            <span class="hidden">Add to Cart</span>
                        </button>
                    </div>
                    
                    <!-- Card Footer (Only visible in list view) -->
                    <div class="card-footer hidden">
                        <div class="flex items-center gap-4">
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                <% if (pro.stock > 0) { %>
                                    <i class="fas fa-check-circle text-green-500 mr-1"></i> In Stock
                                <% } else { %>
                                    <i class="fas fa-times-circle text-red-500 mr-1"></i> Out of Stock
                                <% } %>
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                <i class="fas fa-truck text-primary mr-1"></i> Free Shipping
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <% }) %>
        <% } else { %>
            <div class="col-span-full">
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/>
                        <path d="M16.5 9.4 7.55 4.24"/>
                        <polyline points="3.29 7 12 12 20.71 7"/>
                        <line x1="12" y1="22" x2="12" y2="12"/>
                        <circle cx="18.5" cy="15.5" r="2.5"/>
                        <path d="M20.27 17.27 22 19"/>
                    </svg>
                    <p class="empty-state-text">No products found in our collection.</p>
                    <button onclick="window.location.href='/shoplist'" class="empty-state-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        Back to All Products
                    </button>
                </div>
            </div>
        <% } %>
    </div>

    <!-- Pagination -->
    <% if (product.length > 0) { %>
        <div class="mt-10 text-center">
            <%- include('partials/pagination')%>
        </div>
    <% } %>
</div>

<!-- Quick View Modal (Redesigned Style) -->
<div id="quickViewModal" class="modal">
    <div class="modal-content enhanced-modal p-0 overflow-hidden">
        <div class="flex flex-col md:flex-row">
            <!-- Product Image -->
            <div class="md:w-1/2 modal-product-container">
                <img id="modalProductImage" class="modal-product-image" src="/placeholder.svg" alt="Product Image">
                
                <!-- Close Button -->
                <button onclick="closeQuickView()" class="modal-close-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <!-- Product Details -->
            <div class="md:w-1/2 modal-product-details">
                <div id="modalProductBrand" class="modal-product-brand"></div>
                <h2 id="modalProductName" class="modal-product-title"></h2>
                
                <div class="modal-rating">
                    <div class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                    </div>
                    <span class="count">(4.5)</span>
                </div>
                
                <div id="modalPriceContainer" class="modal-price-container"></div>
                
                <p id="modalDescription" class="modal-description"></p>
                
                <div id="modalStockStatus" class="mb-4"></div>
                
                <div class="modal-action-buttons">
                    <button id="modalAddToCart" class="modal-add-to-cart-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">                 
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                    </button>
                    <a id="modalViewDetails" href="" class="modal-view-details-btn">
                        View Details
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Toast Notification -->
<div id="toast">
    <span id="toast-message"></span>
</div>

<!-- Cart Confirmation Message -->
<div id="cartConfirmation" class="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 w-80 border border-gray-200 dark:border-gray-700 opacity-0 translate-y-10 transition-all duration-300">
    <div class="flex items-center mb-3">
        <div class="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-3">
            <svg class="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <div>
            <h3 class="font-medium text-gray-900 dark:text-white">Added to cart!</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400" id="cart-product-name">Item added to your shopping cart</p>
        </div>
    </div>
    <div class="flex space-x-3">
        <button id="continueShoppingBtn" class="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Continue Shopping
        </button>
        <a href="/addtocart" class="flex-1 py-2 px-3 bg-primary text-white rounded-md text-sm font-medium text-center hover:bg-primary/90 transition-colors">
            Go to Cart
        </a>
    </div>
</div>

<!-- Dark Mode Toggle Button -->
<button id="darkModeToggle" class="dark-mode-toggle">
    <i class="fas fa-moon dark:hidden"></i>
    <i class="fas fa-sun hidden dark:block"></i>
</button>

<!-- Footer -->
<%-include('partials/footer') %>
<%-include('partials/loader') %>

<!-- JavaScript -->
<script>
    // Toggle Filter Section
    document.addEventListener('DOMContentLoaded', function() {
        const filterToggleBtn = document.getElementById('filterToggleBtn');
        const filterSection = document.getElementById('filterSection');
        const filterToggleIcon = document.querySelector('.filter-toggle');
        
        // Hide filter section by default
        filterSection.classList.remove('open');
        
        filterToggleBtn.addEventListener('click', function() {
            filterSection.classList.toggle('open');
            filterToggleIcon.classList.toggle('open');
        });
        
        // Dark mode toggle functionality
        const darkModeToggle = document.getElementById('darkModeToggle');
        const html = document.documentElement;
        
        // Check for saved theme preference or use system preference
        if (localStorage.getItem('darkMode') === 'true' || 
            (!localStorage.getItem('darkMode') && 
             window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.classList.add('dark');
        }
        
        // Toggle dark mode
        darkModeToggle.addEventListener('click', function() {
            html.classList.toggle('dark');
            localStorage.setItem('darkMode', html.classList.contains('dark'));
        });
        
        // View toggle functionality
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        const productsContainer = document.getElementById('productsContainer');
        
        // Toggle to grid view
        gridViewBtn.addEventListener('click', function() {
            productsContainer.classList.remove('products-list');
            productsContainer.classList.add('products-grid');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            
            // Update card elements for grid view
            document.querySelectorAll('.product-card').forEach(card => {
                // Hide elements that should only be visible in list view
                card.querySelector('.product-description')?.classList.add('hidden');
                card.querySelector('.card-footer')?.classList.add('hidden');
                
                // Show elements that should be visible in grid view
                const addToCartBtn = card.querySelector('.add-to-cart-btn');
                if (addToCartBtn) {
                    addToCartBtn.classList.remove('w-auto', 'px-4');
                    addToCartBtn.querySelector('span')?.classList.add('hidden');
                }
            });
            
            // Save preference
            localStorage.setItem('viewMode', 'grid');
        });
        
        // Toggle to list view
        listViewBtn.addEventListener('click', function() {
            productsContainer.classList.remove('products-grid');
            productsContainer.classList.add('products-list');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            
            // Update card elements for list view
            document.querySelectorAll('.product-card').forEach(card => {
                // Show elements that should be visible in list view
                card.querySelector('.product-description')?.classList.remove('hidden');
                card.querySelector('.card-footer')?.classList.remove('hidden');
                
                // Update add to cart button
                const addToCartBtn = card.querySelector('.add-to-cart-btn');
                if (addToCartBtn) {
                    addToCartBtn.classList.add('w-auto', 'px-4');
                    addToCartBtn.querySelector('span')?.classList.remove('hidden');
                }
            });
            
            // Save preference
            localStorage.setItem('viewMode', 'list');
        });
        
        // Load saved view preference
        const savedViewMode = localStorage.getItem('viewMode');
        if (savedViewMode === 'list') {
            listViewBtn.click();
        } else {
            gridViewBtn.click();
        }
        
        // Initialize wishlist status on page load
        loadWishlistStatus();
        
        // Modal option buttons
        document.querySelectorAll('.modal-option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons in the same group
                this.parentElement.querySelectorAll('.modal-option-btn').forEach(b => {
                    b.classList.remove('active');
                });
                // Add active class to clicked button
                this.classList.add('active');
            });
        });
        
        // Initialize product image sliders
        initProductImageSliders();
        
        // Add event listener for continue shopping button
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', hideCartConfirmation);
        }
    });
    
    // Initialize product image sliders
    function initProductImageSliders() {
        document.querySelectorAll('.product-images-slider').forEach(slider => {
            const dots = slider.closest('.card-image-container').querySelectorAll('.image-nav-dot');
            if (dots.length > 0) {
                dots.forEach(dot => {
                    dot.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const index = parseInt(this.getAttribute('data-index'));
                        const slider = this.closest('.card-image-container').querySelector('.product-images-slider');
                        
                        // Update active dot
                        this.closest('.image-nav').querySelectorAll('.image-nav-dot').forEach(d => {
                            d.classList.remove('active');
                        });
                        this.classList.add('active');
                        
                        // Slide to the selected image
                        slider.style.transform = `translateX(-${index * 100}%)`;
                        slider.setAttribute('data-current-image', index);
                    });
                });
            }
        });
    }

    function openQuickView(productId, productName, productImage, description, productPrice, productBrand, maxOffer, salePrice, stock) {
        const modal = document.getElementById('quickViewModal');
        const modalProductName = document.getElementById('modalProductName');
        const modalProductBrand = document.getElementById('modalProductBrand');
        const modalPriceContainer = document.getElementById('modalPriceContainer');
        const modalAddToCart = document.getElementById('modalAddToCart');
        const modalViewDetails = document.getElementById('modalViewDetails');
        const modalStockStatus = document.getElementById('modalStockStatus');
        const modalProductImage = document.getElementById('modalProductImage');
        const modalDescription = document.getElementById('modalDescription');
        
        // Set modal content
        modalProductName.textContent = productName;
        modalProductBrand.textContent = productBrand;
        modalProductImage.src = productImage;
        modalProductImage.alt = productName;
        modalDescription.textContent = description || 'High-performance cycle with advanced features for both casual riders and enthusiasts.';
        
        // Update price display dynamically
        if (maxOffer > 0) {
            modalPriceContainer.innerHTML = `
                <span class="modal-original-price">₹${productPrice}</span>
                <span class="modal-current-price">₹${Math.round(salePrice)}</span>
                <span class="modal-discount-badge">
                    <i class="fas fa-bolt mr-1"></i>
                    ${maxOffer}% OFF
                </span>
            `;
        } else {
            modalPriceContainer.innerHTML = `<span class="modal-current-price">₹${productPrice}</span>`;
        }
        
        // Update stock status
        if (parseInt(stock) === 0) {
            modalStockStatus.innerHTML = `
                <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Out of Stock
                </div>
            `;
            
            modalAddToCart.disabled = true;
            modalAddToCart.classList.add('cursor-not-allowed');
            modalAddToCart.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Out of Stock
            `;
        } else {
            modalStockStatus.innerHTML = `
                <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    In Stock
                </div>
            `;
            
            modalAddToCart.disabled = false;
            modalAddToCart.classList.remove('cursor-not-allowed');
            modalAddToCart.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">                 
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
            `;
            modalAddToCart.setAttribute('onclick', `addToCart('${productId}')`);
        }
        
        modalViewDetails.href = `/productdetails/${productId}`;
        
        // Show modal and prevent body scrolling
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeQuickView() {
        const modal = document.getElementById('quickViewModal');
        modal.classList.remove('show');
        
        // Re-enable body scrolling
        document.body.style.overflow = 'auto';
    }
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('quickViewModal');
        if (event.target === modal) {
            closeQuickView();
        }
    });

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        toastMessage.textContent = message;
        
        if (isError) {
            toast.classList.add('error');
        } else {
            toast.classList.remove('error');
        }
        
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000); // Hide after 3 seconds
    }
    
    // Show cart confirmation message
    function showCartConfirmation() {
        const cartConfirmation = document.getElementById('cartConfirmation');
        cartConfirmation.classList.add('show');
        
        // Hide confirmation after 5 seconds if user doesn't interact with it
        const confirmationTimeout = setTimeout(() => {
            hideCartConfirmation();
        }, 5000);
        
        // Store timeout ID to clear it if user interacts with buttons
        cartConfirmation.dataset.timeoutId = confirmationTimeout;
    }
    
    // Hide cart confirmation message
    function hideCartConfirmation() {
        const cartConfirmation = document.getElementById('cartConfirmation');
        cartConfirmation.classList.remove('show');
        
        // Clear timeout if it exists
        if (cartConfirmation.dataset.timeoutId) {
            clearTimeout(parseInt(cartConfirmation.dataset.timeoutId));
            cartConfirmation.dataset.timeoutId = '';
        }
    }

    // Save wishlist items to localStorage
    function saveWishlistToStorage(productId, isAdded) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        if (isAdded) {
            // Add to wishlist if not already there
            if (!wishlist.includes(productId)) {
                wishlist.push(productId);
            }
        } else {
            // Remove from wishlist
            wishlist = wishlist.filter(id => id !== productId);
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    // Load wishlist status from localStorage and update UI
    function loadWishlistStatus() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        // Get all wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(button => {
            const productId = button.getAttribute('data-product-id');
            const wishlistIcon = button.querySelector('.wishlist-icon');
            const path = wishlistIcon?.querySelector('path');
            
            if (wishlist.includes(productId)) {
                // Update UI for items in wishlist
                wishlistIcon.classList.remove('text-gray-500');
                wishlistIcon.classList.add('text-red-500');
                button.classList.add('active');
                
                // Set fill to current color (red)
                if (path) path.setAttribute('fill', 'currentColor');
            }
        });
        
        // Also fetch from server if user is logged in
        const hasCookie = document.cookie.split(';').some(item => item.trim().startsWith('token='));
        if (hasCookie) {
            fetch('/wishlistStatus', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' 
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && Array.isArray(data.wishlistItems)) {
                    // Merge server wishlist with local wishlist
                    let localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                    
                    // Add server items to local storage
                    data.wishlistItems.forEach(productId => {
                        if (!localWishlist.includes(productId)) {
                            localWishlist.push(productId);
                        }
                        
                        // Update UI for this product
                        updateWishlistUI(productId, true);
                    });
                    
                    // Save merged wishlist to localStorage
                    localStorage.setItem('wishlist', JSON.stringify(localWishlist));
                }
            })
            .catch(error => {
                console.error('Error fetching wishlist status:', error);
            });
        }
    }
    
    // Update wishlist UI for a specific product
    function updateWishlistUI(productId, isInWishlist) {
        // Find all wishlist buttons for this product (could be multiple if same product appears in different views)
        document.querySelectorAll(`.wishlist-btn[data-product-id="${productId}"]`).forEach(button => {
            const wishlistIcon = button.querySelector('.wishlist-icon');
            const path = wishlistIcon?.querySelector('path');
            
            if (isInWishlist) {
                // Add to wishlist UI
                wishlistIcon.classList.remove('text-gray-500');
                wishlistIcon.classList.add('text-red-500');
                button.classList.add('active');
                button.classList.add('wishlist-animation');
                
                // Set fill to current color (red)
                if (path) path.setAttribute('fill', 'currentColor');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    button.classList.remove('wishlist-animation');
                }, 1000);
            } else {
                // Remove from wishlist UI
                wishlistIcon.classList.remove('text-red-500');
                wishlistIcon.classList.add('text-gray-500');
                button.classList.remove('active');
                
                // Set fill to none
                if (path) path.setAttribute('fill', 'none');
            }
        });
    }

    // AJAX function to add to wishlist
    function addToWishlist(productId, button) {
        // Check if it's already in wishlist
        const isInWishlist = button.classList.contains('active');
        
        if (isInWishlist) {
            // Remove from wishlist
            fetch(`/wishlist/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update UI
                    updateWishlistUI(productId, false);
                    
                    // Update localStorage
                    saveWishlistToStorage(productId, false);
                    
                    showToast('Product removed from wishlist!');
                } else {
                    // Even if server request fails, update local storage and UI
                    updateWishlistUI(productId, false);
                    saveWishlistToStorage(productId, false);
                    
                    showToast('Product removed from wishlist!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Even if server request fails, update local storage and UI
                updateWishlistUI(productId, false);
                saveWishlistToStorage(productId, false);
                
                showToast('Product removed from wishlist!');
            });
        } else {
            // Add to wishlist
            fetch('/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId
                }),
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update UI
                    updateWishlistUI(productId, true);
                    
                    // Update localStorage
                    saveWishlistToStorage(productId, true);
                    
                    showToast('Product added to wishlist!');
                } else {
                    // Even if server request fails, update local storage and UI
                    updateWishlistUI(productId, true);
                    saveWishlistToStorage(productId, true);
                    
                    showToast('Product added to wishlist!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Even if server request fails, update local storage and UI
                updateWishlistUI(productId, true);
                saveWishlistToStorage(productId, true);
                
                showToast('Product added to wishlist!');
            });
        }
    }

    // AJAX function to add to cart with automatic wishlist removal
    function addToCart(productId) {
        fetch('/addtocart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1 // Default quantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Get product name for the notification
                const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
                let productName = "Product";
                
                if (productCard) {
                    const titleElement = productCard.querySelector('.product-title');
                    if (titleElement) {
                        productName = titleElement.textContent.trim();
                    }
                }
                
                // Update the cart confirmation with product name
                const cartProductName = document.getElementById('cart-product-name');
                if (cartProductName) {
                    cartProductName.textContent = `${productName} added to your cart`;
                }
                
                // Show toast notification
                showToast('Product added to cart!');
                
                // Show cart confirmation message with redirect option
                showCartConfirmation();
                
                // Animate the cart icon in the header
                const cartIcon = document.querySelector('.fa-shopping-cart');
                if (cartIcon) {
                    cartIcon.classList.add('cart-bounce');
                    setTimeout(() => {
                        cartIcon.classList.remove('cart-bounce');
                    }, 1000);
                }
                
                // Check if product is in wishlist
                const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                if (wishlist.includes(productId)) {
                    // Remove from wishlist automatically
                    removeFromWishlist(productId);
                }
                
                // Update cart count in header
                updateCartCount(1);
                
                // Close modal if it's open
                const modal = document.getElementById('quickViewModal');
                if (modal.classList.contains('show')) {
                    closeQuickView();
                }
            } else {
                showToast(data.message || 'Failed to add product to cart', true);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('An error occurred.', true);
        });
    }
    
    // Show cart confirmation message with enhanced functionality
    function showCartConfirmation() {
        const cartConfirmation = document.getElementById('cartConfirmation');
        cartConfirmation.classList.add('show');
        
        // Hide confirmation after 5 seconds if user doesn't interact with it
        const confirmationTimeout = setTimeout(() => {
            hideCartConfirmation();
        }, 5000);
        
        // Store timeout ID to clear it if user interacts with buttons
        cartConfirmation.dataset.timeoutId = confirmationTimeout;
    }
    
    // Hide cart confirmation message
    function hideCartConfirmation() {
        const cartConfirmation = document.getElementById('cartConfirmation');
        cartConfirmation.classList.remove('show');
        
        // Clear timeout if it exists
        if (cartConfirmation.dataset.timeoutId) {
            clearTimeout(parseInt(cartConfirmation.dataset.timeoutId));
            cartConfirmation.dataset.timeoutId = '';
        }
    }
    
    // Make sure the continue shopping button works
    document.addEventListener('DOMContentLoaded', function() {
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', hideCartConfirmation);
        }
    });

    // Save wishlist items to localStorage
    function saveWishlistToStorage(productId, isAdded) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        if (isAdded) {
            // Add to wishlist if not already there
            if (!wishlist.includes(productId)) {
                wishlist.push(productId);
            }
        } else {
            // Remove from wishlist
            wishlist = wishlist.filter(id => id !== productId);
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    // Load wishlist status from localStorage and update UI
    function loadWishlistStatus() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        // Get all wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(button => {
            const productId = button.getAttribute('data-product-id');
            const wishlistIcon = button.querySelector('.wishlist-icon');
            const path = wishlistIcon?.querySelector('path');
            
            if (wishlist.includes(productId)) {
                // Update UI for items in wishlist
                wishlistIcon.classList.remove('text-gray-500');
                wishlistIcon.classList.add('text-red-500');
                button.classList.add('active');
                
                // Set fill to current color (red)
                if (path) path.setAttribute('fill', 'currentColor');
            }
        });
        
        // Also fetch from server if user is logged in
        const hasCookie = document.cookie.split(';').some(item => item.trim().startsWith('token='));
        if (hasCookie) {
            fetch('/wishlistStatus', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' 
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && Array.isArray(data.wishlistItems)) {
                    // Merge server wishlist with local wishlist
                    let localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                    
                    // Add server items to local storage
                    data.wishlistItems.forEach(productId => {
                        if (!localWishlist.includes(productId)) {
                            localWishlist.push(productId);
                        }
                        
                        // Update UI for this product
                        updateWishlistUI(productId, true);
                    });
                    
                    // Save merged wishlist to localStorage
                    localStorage.setItem('wishlist', JSON.stringify(localWishlist));
                }
            })
            .catch(error => {
                console.error('Error fetching wishlist status:', error);
            });
        }
    }
    
    // Update wishlist UI for a specific product
    function updateWishlistUI(productId, isInWishlist) {
        // Find all wishlist buttons for this product (could be multiple if same product appears in different views)
        document.querySelectorAll(`.wishlist-btn[data-product-id="${productId}"]`).forEach(button => {
            const wishlistIcon = button.querySelector('.wishlist-icon');
            const path = wishlistIcon?.querySelector('path');
            
            if (isInWishlist) {
                // Add to wishlist UI
                wishlistIcon.classList.remove('text-gray-500');
                wishlistIcon.classList.add('text-red-500');
                button.classList.add('active');
                button.classList.add('wishlist-animation');
                
                // Set fill to current color (red)
                if (path) path.setAttribute('fill', 'currentColor');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    button.classList.remove('wishlist-animation');
                }, 1000);
            } else {
                // Remove from wishlist UI
                wishlistIcon.classList.remove('text-red-500');
                wishlistIcon.classList.add('text-gray-500');
                button.classList.remove('active');
                
                // Set fill to none
                if (path) path.setAttribute('fill', 'none');
            }
        });
    }

    // Debounce function to delay execution
    function debounce(func, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Main functionality for filters and sorting
    document.addEventListener('DOMContentLoaded', function () {
        const searchInput = document.getElementById("searchInput");
        const mobileSearchInput = document.getElementById("mobileSearchInput");
        const sortSelect = document.getElementById("sortBy");
        const clearBtn = document.getElementById("clearBtn");
        const applyFiltersBtn = document.querySelector('button.w-full.bg-primary');
        const priceRange = document.getElementById("priceRange");
        const priceValue = document.getElementById("priceValue");

        // Apply filters when input changes (debounced)
        function applyFilters() {
            const queryParams = new URLSearchParams();

            // Get search value from either desktop or mobile input
            const search = searchInput?.value.trim() || mobileSearchInput?.value.trim();
            
            // Get checked categories
            const checkedCategories = document.querySelectorAll('input[name="categoryFilter"]:checked');
            let categoryValues = [];
            
            checkedCategories.forEach(checkbox => {
                if (checkbox.id !== 'allCategories') {
                    // Get the category name from the span element next to the checkbox
                    const categoryName = checkbox.nextElementSibling.textContent.trim();
                    categoryValues.push(categoryName);
                }
            });

            // Get checked brands
            const checkedBrands = document.querySelectorAll('input[name="brandsFilter"]:checked');
            let brandValues = [];
            
            checkedBrands.forEach(checkbox => {
                if (checkbox.id !== 'allBrands') {
                    // Get the brand name from the span element next to the checkbox
                    const brandName = checkbox.nextElementSibling.textContent.trim();
                    brandValues.push(brandName);
                }
            });

            // Get price range
            const maxPrice = priceRange?.value;

            // Get sort value
            const sort = sortSelect?.value;

            // Add non-empty filters to query params
            if (search) queryParams.append("search", search);
            if (categoryValues.length > 0 && !document.getElementById('allCategories').checked) {
                queryParams.append("categoryFilter", categoryValues[0]); // Currently backend handles only one category
            }
            if (brandValues.length > 0 && !document.getElementById('allBrands').checked) {
                queryParams.append("brandsFilter", brandValues[0]); // Currently backend handles only one brand
            }
            if (maxPrice) queryParams.append("maxPrice", maxPrice);
            if (sort) queryParams.append("sortBy", sort);

            // Navigate to filtered URL
            window.location.href = `/shoplist?${queryParams.toString()}`;
        }

        // Function to handle "All Categories" checkbox
        function handleAllCategories() {
            const allCategoriesCheckbox = document.getElementById('allCategories');
            const categoryCheckboxes = document.querySelectorAll('input[name="categoryFilter"]:not(#allCategories)');
            
            if (allCategoriesCheckbox) {
                allCategoriesCheckbox.addEventListener('change', function() {
                    categoryCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                        checkbox.disabled = this.checked;
                    });
                });
                
                // If any individual category is checked, uncheck "All Categories"
                categoryCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        if (this.checked) {
                            allCategoriesCheckbox.checked = false;
                        }
                    });
                });
            }
        }

        // Function to handle "All Brands" checkbox
        function handleAllBrands() {
            const allBrandsCheckbox = document.getElementById('allBrands');
            const brandCheckboxes = document.querySelectorAll('input[name="brandsFilter"]:not(#allBrands)');
            
            if (allBrandsCheckbox) {
                allBrandsCheckbox.addEventListener('change', function() {
                    brandCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                        checkbox.disabled = this.checked;
                    });
                });
                
                // If any individual brand is checked, uncheck "All Brands"
                brandCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        if (this.checked) {
                            allBrandsCheckbox.checked = false;
                        }
                    });
                });
            }
        }

        // Clear all filters
        function clearFilters() {
            const allCategoriesCheckbox = document.getElementById('allCategories');
            const allBrandsCheckbox = document.getElementById('allBrands');
            
            if (searchInput) searchInput.value = "";
            if (mobileSearchInput) mobileSearchInput.value = "";
            if (allCategoriesCheckbox) allCategoriesCheckbox.checked = true;
            if (allBrandsCheckbox) allBrandsCheckbox.checked = true;
            
            document.querySelectorAll('input[name="categoryFilter"]:not(#allCategories)').forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
            
            document.querySelectorAll('input[name="brandsFilter"]:not(#allBrands)').forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
            
            if (sortSelect) sortSelect.value = "";
            if (priceRange) priceRange.value = priceRange.max / 2;
            if (priceValue) priceValue.textContent = `₹${parseInt(priceRange.value).toLocaleString()}`;
            
            window.location.href = '/shoplist';
        }

        // Restore filter values from URL on page load
        function restoreFiltersFromURL() {
            const params = new URLSearchParams(window.location.search);
            
            // Restore search
            const searchParam = params.get("search");
            if (searchParam) {
                if (searchInput) searchInput.value = searchParam;
                if (mobileSearchInput) mobileSearchInput.value = searchParam;
            }
            
            // Restore category filters
            const categoryParam = params.get("categoryFilter");
            if (categoryParam) {
                const allCategoriesCheckbox = document.getElementById('allCategories');
                if (allCategoriesCheckbox) {
                    allCategoriesCheckbox.checked = false;
                }
                
                // Check the appropriate category checkbox
                document.querySelectorAll('input[name="categoryFilter"]:not(#allCategories)').forEach(checkbox => {
                    const categoryName = checkbox.nextElementSibling.textContent.trim();
                    checkbox.checked = categoryName === categoryParam;
                    checkbox.disabled = false;
                });
            }
            
            // Restore brand filters
            const brandParam = params.get("brandsFilter");
            if (brandParam) {
                const allBrandsCheckbox = document.getElementById('allBrands');
                if (allBrandsCheckbox) {
                    allBrandsCheckbox.checked = false;
                }
                
                // Check the appropriate brand checkbox
                document.querySelectorAll('input[name="brandsFilter"]:not(#allBrands)').forEach(checkbox => {
                    const brandName = checkbox.nextElementSibling.textContent.trim();
                    checkbox.checked = brandName === brandParam;
                    checkbox.disabled = false;
                });
            }
            
            // Restore price range
            const maxPriceParam = params.get("maxPrice");
            if (maxPriceParam && priceRange && priceValue) {
                priceRange.value = maxPriceParam;
                priceValue.textContent = `₹${parseInt(maxPriceParam).toLocaleString()}`;
            }
            
            // Restore sort
            if (sortSelect) {
                sortSelect.value = params.get("sortBy") || "";
            }
        }

        // Update price value display when slider changes
        if (priceRange && priceValue) {
            priceRange.addEventListener("input", function() {
                priceValue.textContent = `₹${parseInt(this.value).toLocaleString()}`;
            });
        }

        // Add event listeners
        if (searchInput) {
            searchInput.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    applyFilters();
                }
            });
        }
        
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    applyFilters();
                }
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener("change", applyFilters);
        }
        
        if (clearBtn) {
            clearBtn.addEventListener("click", clearFilters);
        }
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener("click", applyFilters);
        }
        
        if (priceRange) {
            priceRange.addEventListener("change", applyFilters);
        }

        // Initialize checkbox handlers
        handleAllCategories();
        handleAllBrands();
        
        // Initialize filters from URL
        restoreFiltersFromURL();
        
        // Mobile menu toggle functionality
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', function() {
                // Toggle the 'hidden' class on the mobile menu
                mobileMenu.classList.toggle('hidden');
                
                // Change the icon based on menu state
                const icon = mobileMenuButton.querySelector('i');
                if (icon) {
                    if (mobileMenu.classList.contains('hidden')) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    } else {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                    }
                }
            });
        }
    });
    
    // Function to remove from wishlist after adding to cart
    function removeFromWishlist(productId) {
        fetch(`/wishlist/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            // Update UI
            updateWishlistUI(productId, false);
            
            // Update localStorage
            saveWishlistToStorage(productId, false);
            
            showToast('Product moved from wishlist to cart!');
        })
        .catch(error => {
            console.error('Error removing from wishlist:', error);
            // Still update UI and localStorage even if server request fails
            updateWishlistUI(productId, false);
            saveWishlistToStorage(productId, false);
        });
    }
    
    // Update cart count in header
    function updateCartCount(increment) {
        const cartCountElement = document.querySelector('.fa-shopping-cart + span');
        if (cartCountElement) {
            const currentCount = parseInt(cartCountElement.textContent);
            cartCountElement.textContent = currentCount + increment;
        }
    }
</script>
</body>
</html>
