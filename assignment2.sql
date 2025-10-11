--1. insert new record 
INSERT INTO public.account(
	account_firstname, 
	account_lastname, 
	account_email, 
	account_password
)
VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
);

--2 modify record to Admin
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com'

--3 Delete Tony Stark
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

--4 Modify GM Hummer
UPDATE inventory
SET  inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior')
WHERE inv_model = 'Hummer';

--5- Select inv_make and inv_model and classification_name
SELECT i.inv_make, i.inv_model, c.classification_name
fROM inventory i
INNER JOIN classification c
	ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

--6- update records in the inventory /vehicles
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images/','/images/vehicles/');

UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'manager@340.edu'

UPDATE account
SET account_type = 'Admin'
WHERE account_email = happy@340.edu'