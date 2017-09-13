make: build
	
build: run
	
run:
	open ./index.html

deploy:
        rsync -vrc * mli-field@fielddaylab.wisc.edu:/httpdocs/scratch/model
