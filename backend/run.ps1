Get-Content .env | ForEach-Object {
    if ($_ -match "^(?<name>[^=]+)=(?<value>.*)$") {
        $name = $Matches['name'].Trim()
        $value = $Matches['value'].Trim()
        [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}
.\mvnw spring-boot:run
