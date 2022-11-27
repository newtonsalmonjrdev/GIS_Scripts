def checklist():
    # will create a for loop to wrap around the second column

    file1 = open('firstColumn.txt', 'r')
    file2 = open('secondColumn.txt', 'r')
    lines1 = file1.readlines()
    lines2 = file2.readlines()

    with open("confirmMatch.txt", "w") as fp:
            for line1 in lines1:
                for line2 in lines2:
                    if line2 == line1:
                        fp.writelines("Found match for: " + line2)
                    else:
                        continue

    file1.close()
    file2.close()


checklist()
