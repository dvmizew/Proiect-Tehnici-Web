DROP TYPE IF EXISTS categorie_produs cascade;
DROP TYPE IF EXISTS tip_produs cascade;
DROP TABLE IF EXISTS products CASCADE;

CREATE TYPE categorie_produs AS ENUM( 'Retelistica', 'Adaptoare', 'Cabluri', 'Accesorii');

CREATE TYPE tip_produs AS ENUM('Router', 'Switch', 'Adaptor', 'Cablu', 'Conector', 'Extensor');

CREATE TABLE IF NOT EXISTS products (
   id SERIAL PRIMARY KEY,
   nume VARCHAR(100) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   categorie_produs categorie_produs DEFAULT 'Cabluri',
   tip_produs tip_produs DEFAULT 'Conector',
   imagine VARCHAR(300),
   disponibil BOOLEAN DEFAULT TRUE,
   data_adaugare TIMESTAMP DEFAULT current_timestamp,
   conectori VARCHAR[],
   nr_porturi INT,
   brand VARCHAR(100)
);

INSERT INTO products (nume, descriere, pret, categorie_produs, tip_produs, imagine, nr_porturi, brand) VALUES 
('Router Ethernet Gigabit', 'Router Ethernet Gigabit cu patru porturi pentru o conectivitate rapidă și fiabilă', 69.99, 'Retelistica', 'Router', 'router_gigabit.jpg', 4, 'TP-Link'),
('Switch cu 8 porturi', 'Switch cu 8 porturi 10/100/1000 Mbps pentru extinderea rețelei tale', 39.99, 'Retelistica', 'Switch', 'switch_8_porturi.jpg', 8, 'D-Link'),
('Adaptor USB 3.0 la Gigabit Ethernet', 'Adaptor USB 3.0 la Gigabit Ethernet pentru conectarea dispozitivelor la rețea', 19.99, 'Adaptoare', 'Adaptor', 'usb_ethernet.jpg', NULL, 'UGREEN'),
('Cablu HDMI 4K', 'Cablu HDMI 4K de înaltă viteză pentru transmiterea semnalului video și audio', 15.99, 'Cabluri', 'Cablu', 'cablu_hdmi_4k.jpg', NULL, 'AmazonBasics'),
('Conector RJ45', 'Conector RJ45 pentru cabluri Ethernet, ușor de instalat', 4.99, 'Accesorii', 'Conector', 'conector_rj45.jpg', NULL, 'UGREEN'),
('Extensor WiFi', 'Extensor WiFi pentru extinderea acoperirii rețelei tale fără fir', 29.99, 'Retelistica', 'Extensor', 'extensor_wifi.jpg', NULL, 'TP-Link'),
('Router wireless dual-band', 'Router wireless dual-band pentru o conectivitate stabilă și rapidă', 79.99, 'Retelistica', 'Router', 'router_dual_band.jpg', NULL, 'Asus'),
('Hub USB-C', 'Hub USB-C cu multiple porturi pentru conectarea mai multor dispozitive la laptop', 49.99, 'Accesorii', 'Adaptor', 'hub_usb_c.jpg', NULL, 'Anker'),
('Cablu Ethernet blindat', 'Cablu Ethernet blindat cu conectori RJ45, pentru o conexiune sigură și stabilă', 12.99, 'Retelistica', 'Cablu', 'cablu_ethernet_blindat.jpg', NULL, 'UGREEN'),
('Switch PoE cu 5 porturi', 'Switch PoE cu 5 porturi pentru alimentarea dispozitivelor prin cablul Ethernet', 99.99, 'Retelistica', 'Switch', 'switch_poe.jpg', 5, 'D-Link'),
('Adaptor Bluetooth 5.0', 'Adaptor Bluetooth 5.0 pentru conectarea dispozitivelor fără fir la PC sau laptop', 9.99, 'Adaptoare', 'Adaptor', 'adaptor_bluetooth.jpg', NULL, 'Avantree'),
('Cablu de alimentare SATA', 'Cablu de alimentare SATA pentru conectarea unităților de stocare la sursa de alimentare', 5.99, 'Cabluri', 'Cablu', 'cablu_sata.jpg', NULL, 'Cable Matters'),
('Switch gestionabil', 'Switch gestionabil cu 24 porturi pentru administrarea avansată a rețelei', 299.99, 'Retelistica', 'Switch', 'switch_gestionabil.jpg', 24, 'Cisco'),
('Adaptor HDMI la VGA', 'Adaptor HDMI la VGA pentru conectarea dispozitivelor HDMI la monitoare VGA', 14.99, 'Adaptoare', 'Adaptor', 'hdmi_vga.jpg', NULL, 'UGREEN'),
('Cablu de rețea Cat6', 'Cablu de rețea Cat6 pentru transferul rapid al datelor la o viteză de până la 1000 Mbps', 8.99, 'Cabluri', 'Cablu', 'cablu_retea_cat6.jpg', NULL, 'Jadaol'),
('Conector RJ45 crimpat', 'Conector RJ45 crimpat pentru cabluri de rețea, pentru o conexiune sigură', 7.99, 'Accesorii', 'Conector', 'conector_rj45_crimpat.jpg', NULL, 'CableCreation');
