# GEOID_CensusMod

# open both files
with open('GEOID_CensusMod.txt', 'r') as firstfile, open('GEOID_CensusMod_GISready.txt', 'w') as secondfile:
    # read content from first file
    for line in firstfile:
            line_format = line[9:]
            # append content to second file
            secondfile.write(line_format)
    secondfile.flush()