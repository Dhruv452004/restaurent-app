# 📝 Menu Management Guide:

# - Add new items by copying and pasting the dictionary format above

# - Set "available" to False to temporarily hide items from the menu

# - Use existing categories: starters, main_course, desserts, beverages

# - Image URLs should always start with "static/images/"

# - Keep prices in decimal format for consistency

# - Maintain the same structure for all menu items

menu_items = [
    {
        "name": "Paneer Tikka",
        "description": "Grilled paneer with spices",
        "price": 250.0,
        "category": "starters",
        "image_url": "static/images/paneertikka.png",
        "available": True
    },
    {
        "name": "Shahi Paneer",
        "description": "Creamy tomato curry with paneer",
        "price": 350.0,
        "category": "main_course",
        "image_url": "static/images/shahipaneer.png",
        "available": True
    },
    {
        "name": "Gulab Jamun",
        "description": "Sweet milk dumplings in syrup",
        "price": 120.0,
        "category": "desserts",
        "image_url": "static/images/gulabjamun.png",
        "available": True
    },
    {
        "name": "Lassi",
        "description": "Traditional yogurt drink",
        "price": 80.0,
        "category": "beverages",
        "image_url": "static/images/lassi.png",
        "available": True
    },
]
