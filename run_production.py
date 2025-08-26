#!/usr/bin/env python3
import csv
import json
import time
import subprocess
from datetime import datetime

API_URL = "https://adrata-pipelines-8lsb7z0z0-adrata.vercel.app/api/production-ready"

def load_companies(filename, limit=None):
    companies = []
    with open(filename, 'r') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if limit and i >= limit:
                break
            website = row['Website']
            company_name = website.replace('https://', '').replace('http://', '').replace('www.', '').split('.')[0].title()
            companies.append({
                'companyName': company_name,
                'domain': website,
                'accountOwner': row['Account Owner']
            })
    return companies

def run_single_pipeline(pipeline_type, companies, output_dir):
    print(f"🚀 Running {pipeline_type.upper()} pipeline for {len(companies)} companies...")
    
    # Create payload
    payload = {'pipeline': pipeline_type, 'companies': companies}
    temp_file = f"/tmp/{pipeline_type}_payload.json"
    
    with open(temp_file, 'w') as f:
        json.dump(payload, f)
    
    # Run curl command
    start_time = time.time()
    result = subprocess.run([
        'curl', '-X', 'POST', API_URL,
        '-H', 'Content-Type: application/json',
        '-d', f'@{temp_file}',
        '--max-time', '300',
        '--silent'
    ], capture_output=True, text=True)
    
    elapsed = time.time() - start_time
    
    if result.returncode == 0:
        try:
            data = json.loads(result.stdout)
            if 'results' in data:
                results = data['results']
                print(f"✅ {pipeline_type.upper()}: {len(results)} results in {elapsed:.1f}s")
                
                # Save CSV
                csv_file = f"{output_dir}/{pipeline_type}-pipeline-results.csv"
                if results:
                    with open(csv_file, 'w', newline='') as f:
                        writer = csv.DictWriter(f, fieldnames=results[0].keys())
                        writer.writeheader()
                        writer.writerows(results)
                    print(f"💾 Saved: {csv_file}")
                
                return results, elapsed
            else:
                print(f"❌ {pipeline_type.upper()} error: {data}")
                return [], elapsed
        except json.JSONDecodeError:
            print(f"❌ {pipeline_type.upper()} invalid JSON response")
            return [], elapsed
    else:
        print(f"❌ {pipeline_type.upper()} curl failed: {result.stderr}")
        return [], elapsed

def main():
    print("🚀 ADRATA PRODUCTION RUNNER")
    print("===========================")
    
    # Create output directory
    output_dir = "/Users/rosssylvester/Desktop/FINAL"
    subprocess.run(['mkdir', '-p', output_dir], check=False)
    
    # Load companies
    all_companies = load_companies('inputs/all-1233-companies.csv')
    print(f"📊 Loaded {len(all_companies)} companies")
    
    total_start = time.time()
    
    # Run pipelines
    core_results, core_time = run_single_pipeline('core', all_companies, output_dir)
    advanced_results, advanced_time = run_single_pipeline('advanced', all_companies[:100], output_dir)
    powerhouse_results, powerhouse_time = run_single_pipeline('powerhouse', all_companies[:10], output_dir)
    
    total_time = time.time() - total_start
    
    print(f"\n🎉 PRODUCTION COMPLETE!")
    print(f"📊 Core: {len(core_results)} results")
    print(f"📊 Advanced: {len(advanced_results)} results") 
    print(f"📊 Powerhouse: {len(powerhouse_results)} results")
    print(f"⏱️  Total time: {total_time/60:.1f} minutes")
    
    # Save summary
    summary = {
        'core': len(core_results),
        'advanced': len(advanced_results),
        'powerhouse': len(powerhouse_results),
        'total_time_minutes': round(total_time/60, 1)
    }
    
    with open(f"{output_dir}/summary.json", 'w') as f:
        json.dump(summary, f, indent=2)

if __name__ == "__main__":
    main()
