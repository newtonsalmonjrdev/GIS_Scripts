# open both files
with open('Foresty_coord_csv_auto_txt.txt', 'r') as firstfile, open('Forestry_coord_long.txt', 'w+') as secondfile:
    # read content from first file
    for line in firstfile:
        if not line.strip():
            secondfile.write("\n")
            continue
        else:
            line_format = line.replace("(", "").replace(")", "").replace(",", "").replace("\"","")
            line_format = line_format.split(" ")

            # append content to second file
            secondfile.write(line_format[-1])
    secondfile.flush()

