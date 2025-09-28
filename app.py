# app.py - Main Flask Application
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurant.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(200))
    available = db.Column(db.Boolean, default=True)

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    guests = db.Column(db.Integer, nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/')
def home():
    # Featured menu items
    featured_items = MenuItem.query.filter_by(available=True).limit(6).all()
    return render_template('home.html', featured_items=featured_items)

@app.route('/menu')
def menu():
    category = request.args.get('category', 'all')
    if category == 'all':
        items = MenuItem.query.filter_by(available=True).all()
    else:
        items = MenuItem.query.filter_by(category=category, available=True).all()
    
    categories = ['starters', 'main_course', 'desserts', 'beverages']
    return render_template('menu.html', items=items, categories=categories, current_category=category)

@app.route('/reservations', methods=['GET', 'POST'])
def reservations():
    if request.method == 'POST':
        # Handle reservation form
        reservation = Reservation(
            name=request.form['name'],
            email=request.form['email'],
            phone=request.form['phone'],
            date=datetime.strptime(request.form['date'], '%Y-%m-%d').date(),
            time=datetime.strptime(request.form['time'], '%H:%M').time(),
            guests=int(request.form['guests']),
            message=request.form.get('message', '')
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        flash('Reservation request submitted! We will confirm shortly.', 'success')
        return redirect(url_for('reservations'))
    
    return render_template('reservations.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Handle contact form
        contact = Contact(
            name=request.form['name'],
            email=request.form['email'],
            subject=request.form['subject'],
            message=request.form['message']
        )
        
        db.session.add(contact)
        db.session.commit()
        
        flash('Message sent successfully! We will get back to you soon.', 'success')
        return redirect(url_for('contact'))
    
    return render_template('contact.html')

# Admin Routes
@app.route('/admin')
def admin():
    return render_template('admin/dashboard.html')

@app.route('/admin/menu')
def admin_menu():
    items = MenuItem.query.all()
    return render_template('admin/menu.html', items=items)

@app.route('/admin/reservations')
def admin_reservations():
    reservations = Reservation.query.order_by(Reservation.created_at.desc()).all()
    return render_template('admin/reservations.html', reservations=reservations)

@app.route('/admin/contacts')
def admin_contacts():
    contacts = Contact.query.order_by(Contact.created_at.desc()).all()
    return render_template('admin/contacts.html', contacts=contacts)

# API Routes
@app.route('/api/menu')
def api_menu():
    items = MenuItem.query.filter_by(available=True).all()
    return jsonify([{
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'price': item.price,
        'category': item.category,
        'image_url': item.image_url
    } for item in items])

@app.route('/api/reservation/<int:id>/confirm', methods=['POST'])
def confirm_reservation(id):
    reservation = Reservation.query.get_or_404(id)
    reservation.status = 'confirmed'
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Reservation confirmed'})

# Initialize database
def create_tables():
    with app.app_context():
        db.create_all()
        
        # Add sample menu items if empty
        if MenuItem.query.count() == 0:
            sample_items = [
                MenuItem(name='Paneer Tikka', description='Grilled with spices', price=250.0, category='starters', image_url='/static/images/test.webp'),

                MenuItem(name='Malai Chaap', description='Creamy tomato curry with cheese', price=350.0, category='main_course', image_url='/static/images/test.webp'),
                
                MenuItem(name='Gulab Jamun', description='Sweet milk dumplings in syrup', price=120.0, category='desserts', image_url='/static/images/test.webp'),
                MenuItem(name='Lassi', description='Traditional yogurt drink', price=80.0, category='beverages', image_url='/static/images/test.webp'),
            ]
            
            for item in sample_items:
                db.session.add(item)
            db.session.commit()

# Call this when starting the app
create_tables()

if __name__ == '__main__':
    app.run(debug=False)