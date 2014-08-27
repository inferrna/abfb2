import swacc
for lang in swacc.var['langs'].keys():
    f = open('www/scripts/swaclangs/'+lang+'.js', 'w')
    f.write('define([], function(){\n return '+str(swacc.var['langs'][lang])+';\n});')
    f.close()
