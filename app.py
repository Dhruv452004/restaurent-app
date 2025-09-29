# app.py - main app
from flask import Flask, render_template, request, jsonify
from menu import menu_items
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# --- Flask setup ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# --- Database config (Local + Render + Vercel) ---
if os.environ.get('VERCEL'):
    # Vercel → only /tmp is writable (not persistent)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tmp/restaurant.db'
elif os.environ.get('RENDER'):
    # Render → use instance folder (persistent)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/restaurant.db'
else:
    # Local development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurant.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Models ---
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

# --- Email Function ---
def send_email(subject, body):
    sender_email = "yourgmail@gmail.com"  # Replace with your Gmail
    sender_password = "your-app-password"  # Gmail App Password
    receiver_email = "dhruvsaxena3002@gmail.com"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")

# --- Routes ---
@app.route('/')
def home():
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
        try:
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

            # Send email notification
            email_subject = f"New Reservation from {reservation.name}"
            email_body = f"""
            Name: {reservation.name}
            Email: {reservation.email}
            Phone: {reservation.phone}
            Date: {reservation.date}
            Time: {reservation.time}
            Guests: {reservation.guests}
            Message: {reservation.message}
            """
            send_email(email_subject, email_body)
            return jsonify({'success': True, 'message': 'Reservation submitted and email sent!'})
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({'success': False, 'message': 'Error processing reservation'}), 400
    return render_template('reservations.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        try:
            contact = Contact(
                name=request.form['name'],
                email=request.form['email'],
                subject=request.form['subject'],
                message=request.form['message']
            )
            db.session.add(contact)
            db.session.commit()

            # Send email notification
            email_subject = f"New Contact Message from {contact.name}"
            email_body = f"""
            Name: {contact.name}
            Email: {contact.email}
            Subject: {contact.subject}
            Message: {contact.message}
            """
            send_email(email_subject, email_body)
            return jsonify({'success': True, 'message': 'Message sent and email notification sent!'})
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({'success': False, 'message': 'Error sending message'}), 400
    return render_template('contact.html')

# --- Initialize database and menu items ---
def create_tables():
    with app.app_context():
        db.create_all()
        if MenuItem.query.count() == 0:
            for item in menu_items:
                db.session.add(MenuItem(
                    name=item["name"],
                    description=item.get("description"),
                    price=item["price"],
                    category=item["category"],
                    image_url=item.get("image_url"),
                    available=item.get("available", True)
                ))
            db.session.commit()

create_tables()

# --- Run App ---
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
