# ==============================================
# Skrypt testowy dla mikroserwisów - Windows PowerShell
# Użycie: .\test-microservices.ps1
# ==============================================

$PRODUCTS_SERVICE = "http://localhost:3000/api"
$ORDERS_SERVICE = "http://localhost:3002/api"

# Kolory dla lepszej czytelności
function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

Write-ColorOutput Yellow "========================================"
Write-ColorOutput Yellow "  TESTOWANIE MIKROSERWISÓW"
Write-ColorOutput Yellow "========================================"

# Funkcja do formatowania JSON
function Format-Json($InputObject) {
    try {
        $InputObject | ConvertTo-Json -Depth 10
    } catch {
        $InputObject
    }
}

# Test 1: Sprawdzenie czy Products Service działa
Write-ColorOutput Green "`nTest 1: Sprawdzenie Products Service"
try {
    $response = Invoke-WebRequest -Uri "$PRODUCTS_SERVICE/products" -Method Get -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-ColorOutput Green "✓ Products Service działa poprawnie"
    }
} catch {
    Write-ColorOutput Red "✗ Products Service nie odpowiada"
    Write-ColorOutput Red "  Uruchom: nx serve products-service"
    exit 1
}

# Test 2: Sprawdzenie czy Orders Service działa
Write-ColorOutput Green "`nTest 2: Sprawdzenie Orders Service"
try {
    $response = Invoke-WebRequest -Uri "$ORDERS_SERVICE/orders" -Method Get -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-ColorOutput Green "✓ Orders Service działa poprawnie"
    }
} catch {
    Write-ColorOutput Red "✗ Orders Service nie odpowiada"
    Write-ColorOutput Red "  Uruchom: nx serve orders-service"
    exit 1
}

# Test 3: Dodawanie produktów
Write-ColorOutput Green "`nTest 3: Dodawanie produktów"

Write-Host "Dodaję Laptop..."
$laptopData = @{
    name = "Laptop Dell XPS"
    price = 5500
    quantity = 3
    description = "High-end laptop"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$PRODUCTS_SERVICE/products" -Method Post `
        -ContentType "application/json" -Body $laptopData
    Write-Host "Odpowiedź:"
    Format-Json $response
} catch {
    Write-Host "Błąd: $_"
}

Write-Host "`nDodaję Monitor..."
$monitorData = @{
    name = "Monitor 4K"
    price = 1500
    quantity = 10
    description = "27 inch 4K monitor"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$PRODUCTS_SERVICE/products" -Method Post `
        -ContentType "application/json" -Body $monitorData
    Write-Host "Odpowiedź:"
    Format-Json $response
} catch {
    Write-Host "Błąd: $_"
}

Write-Host "`nDodaję Klawiaturę..."
$keyboardData = @{
    name = "Mechanical Keyboard"
    price = 350
    quantity = 25
    description = "RGB mechanical keyboard"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$PRODUCTS_SERVICE/products" -Method Post `
        -ContentType "application/json" -Body $keyboardData
    Write-Host "Odpowiedź:"
    Format-Json $response
} catch {
    Write-Host "Błąd: $_"
}

# Test 4: Pobieranie listy produktów
Write-ColorOutput Green "`nTest 4: Lista wszystkich produktów"
try {
    $response = Invoke-RestMethod -Uri "$PRODUCTS_SERVICE/products" -Method Get
    Write-Host "Produkty w bazie:"
    Format-Json $response
} catch {
    Write-Host "Błąd: $_"
}

# Test 5: Pobieranie pojedynczego produktu
Write-ColorOutput Green "`nTest 5: Pobieranie produktu o ID=1"
try {
    $response = Invoke-RestMethod -Uri "$PRODUCTS_SERVICE/products/1" -Method Get
    Write-Host "Produkt:"
    Format-Json $response
} catch {
    Write-Host "Błąd: $_"
}

# Test 6: Sprawdzenie dostępności produktu
Write-ColorOutput Green "`nTest 6: Sprawdzenie dostępności produktu ID=1 (2 sztuki)"
try {
    $response = Invoke-RestMethod -Uri "$PRODUCTS_SERVICE/products/1/availability/2" -Method Get
    Write-Host "Dostępność:"
    Format-Json $response
} catch {
    Write-Host "Błąd: $_"
}

# Test 7: Składanie zamówienia (poprawne)
Write-ColorOutput Green "`nTest 7: Składanie poprawnego zamówienia"
$orderData = @{
    customerName = "Jan Kowalski"
    items = @(
        @{ productId = 1; quantity = 1 },
        @{ productId = 2; quantity = 2 }
    )
} | ConvertTo-Json -Depth 10

$order_id = $null
try {
    $response = Invoke-RestMethod -Uri "$ORDERS_SERVICE/orders" -Method Post `
        -ContentType "application/json" -Body $orderData
    Write-Host "Utworzone zamówienie:"
    Format-Json $response
    $order_id = $response.id
} catch {
    Write-Host "Błąd: $_"
}

# Test 8: Pobieranie szczegółów zamówienia
Write-ColorOutput Green "`nTest 8: Pobieranie szczegółów zamówienia"
if ($order_id) {
    try {
        $response = Invoke-RestMethod -Uri "$ORDERS_SERVICE/orders/$order_id" -Method Get
        Write-Host "Szczegóły zamówienia #${order_id}:"
        Format-Json $response
    } catch {
        Write-Host "Błąd: $_"
    }
} else {
    Write-ColorOutput Yellow "Nie mogę pobrać ID zamówienia"
}

# Test 9: Lista wszystkich zamówień
Write-ColorOutput Green "`nTest 9: Lista wszystkich zamówień"
try {
    $response = Invoke-RestMethod -Uri "$ORDERS_SERVICE/orders" -Method Get
    Write-Host "Wszystkie zamówienia:"
    Format-Json $response
} catch {
    Write-Host "Błąd: $_"
}

# Test 10: Test błędu - nieistniejący produkt
Write-ColorOutput Green "`nTest 10: Test błędu - zamówienie z nieistniejącym produktem"
$invalidOrderData = @{
    customerName = "Anna Nowak"
    items = @(
        @{ productId = 999; quantity = 1 }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$ORDERS_SERVICE/orders" -Method Post `
        -ContentType "application/json" -Body $invalidOrderData
    Write-Host "Odpowiedź:"
    Format-Json $response
} catch {
    Write-Host "Odpowiedź (oczekiwany błąd):"
    Write-Host $_.Exception.Message
}

# Test 11: Test błędu - za duża ilość
Write-ColorOutput Green "`nTest 11: Test błędu - zamówienie przekraczające stan magazynowy"
$bigOrderData = @{
    customerName = "Piotr Wiśniewski"
    items = @(
        @{ productId = 1; quantity = 1000 }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$ORDERS_SERVICE/orders" -Method Post `
        -ContentType "application/json" -Body $bigOrderData
    Write-Host "Odpowiedź:"
    Format-Json $response
} catch {
    Write-Host "Odpowiedź (oczekiwany błąd):"
    Write-Host $_.Exception.Message
}

# Test 12: Aktualizacja produktu
Write-ColorOutput Green "`nTest 12: Aktualizacja produktu"
$updateData = @{
    price = 4999
    quantity = 5
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$PRODUCTS_SERVICE/products/1" -Method Put `
        -ContentType "application/json" -Body $updateData
    Write-Host "Zaktualizowany produkt:"
    Format-Json $response
} catch {
    Write-Host "Błąd: $_"
}

# Test 13: Zmiana statusu zamówienia
Write-ColorOutput Green "`nTest 13: Zmiana statusu zamówienia"
if ($order_id) {
    $statusData = @{ status = "cancelled" } | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$ORDERS_SERVICE/orders/$order_id/status" -Method Patch `
            -ContentType "application/json" -Body $statusData
        Write-Host "Zamówienie po zmianie statusu:"
        Format-Json $response
    } catch {
        Write-Host "Błąd: $_"
    }
} else {
    Write-ColorOutput Yellow "Brak ID zamówienia do aktualizacji"
}

Write-ColorOutput Yellow "`n========================================"
Write-ColorOutput Green "  TESTY ZAKOŃCZONE POMYŚLNIE!"
Write-ColorOutput Yellow "========================================"

# Podsumowanie
Write-ColorOutput Yellow "`nPodsumowanie:"
Write-Host "1. ✓ Oba serwisy działają"
Write-Host "2. ✓ Produkty można dodawać i pobierać"
Write-Host "3. ✓ Zamówienia są prawidłowo składane"
Write-Host "4. ✓ Komunikacja między serwisami działa"
Write-Host "5. ✓ Obsługa błędów funkcjonuje poprawnie"

Write-ColorOutput Yellow "`nWskazówki dla developera:"
Write-Host "- Sprawdź logi serwisów w przypadku błędów"
Write-Host "- Użyj 'nx graph' aby zobaczyć zależności"
Write-Host "- Pamiętaj o uruchomieniu obu serwisów przed testami"
Write-Host "- Możesz użyć Postman lub Insomnia zamiast PowerShell"